const $=s=>document.querySelector(s);let codes=[];const fields=['search','themeFilter','sectorFilter','groupFilter'];const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){const search=$('#search').value.toLowerCase().trim(),theme=$('#themeFilter').value,sector=$('#sectorFilter').value,group=$('#groupFilter').value;const found=codes.filter(c=>(!search||[c.code,c.label,c.definition,c.theme,c.sector,c.category].join(' ').toLowerCase().includes(search))&&(!theme||c.theme===theme)&&(!sector||c.sector.split(', ').includes(sector))&&(!group||c.category.includes(group)));$('#resultCount').textContent=`${found.length} of ${codes.length} codes`;$('#empty').hidden=found.length>0;$('#codeList').innerHTML=found.map(c=>`<article class="code-card"><span class="code-id">${esc(c.code)}</span><div><h3>${esc(c.label)}</h3><p>${esc(c.definition)}</p><small class="code-theme">${esc(c.theme)}</small></div><div class="coverage"><strong>${esc(c.sector)}</strong><small>${esc(c.category)}</small></div></article>`).join('')}
fetch('content--appendix.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{codes=d;for(const t of [...new Set(d.map(c=>c.theme))])$('#themeFilter').add(new Option(t,t));for(const s of ['Hong Kong','Japan','Myanmar','Malaysia','Philippines','Thailand','Singapore'])$('#sectorFilter').add(new Option(s,s));render()}).catch(()=>{$('#resultCount').textContent='The appendix could not load. Download the full PDF or reload to try again.'});fields.forEach(f=>$('#'+f).addEventListener(f==='search'?'input':'change',render));$('#reset').onclick=()=>{fields.forEach(f=>$('#'+f).value='');render()};document.querySelectorAll('[data-sector]').forEach(a=>a.onclick=()=>{$('#sectorFilter').value=a.dataset.sector;render()});
const chapters=[...document.querySelectorAll('.chapter')];let active=0,present=false;function update(){let best=Infinity;chapters.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().top-90);if(d<best){best=d;active=i}});$('#slideCount').textContent=`${active+1} / ${chapters.length}`}function go(delta){update();chapters[Math.max(0,Math.min(chapters.length-1,active+delta))].scrollIntoView()}function toggle(value){present=value;document.body.classList.toggle('presenting',value);$('.present-controls').hidden=!value;$('#present').setAttribute('aria-pressed',String(value));update()}$('#present').onclick=()=>toggle(!present);$('#exit').onclick=()=>toggle(false);$('#next').onclick=()=>go(1);$('#previous').onclick=()=>go(-1);addEventListener('scroll',update,{passive:true});addEventListener('keydown',e=>{if(!present||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='Escape')toggle(false);if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(-1)}});update();

(() => {
  const atlas = document.getElementById('sectors');
  const gallery = document.getElementById('atlas-gallery');
  const track = gallery.querySelector('.atlas-track');
  const stories = Array.from(track.children);
  const links = Array.from(atlas.querySelectorAll('a[href^="#story-"]'));
  const previous = document.getElementById('atlas-prev');
  const next = document.getElementById('atlas-next');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeStory = 0;
  let opener;
  let drag;

  atlas.classList.add('atlas-enhanced');
  gallery.hidden = true;

  function setActive(index) {
    activeStory = index;
    const hash = '#' + stories[index].id;
    for (const link of links) {
      if (link.hash === hash) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    previous.disabled = index === 0;
    next.disabled = index === stories.length - 1;
  }

  function showStory(index, behavior = 'instant') {
    setActive(Math.max(0, Math.min(index, stories.length - 1)));
    const left = stories[activeStory].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior: reduceMotion.matches ? 'instant' : behavior });
  }

  for (const link of links) {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      gallery.hidden = false;
      showStory(stories.findIndex(story => '#' + story.id === link.hash));
      stories[activeStory].querySelector('h3').focus({ preventScroll: true });
      gallery.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    });
  }

  function backToMap() {
    gallery.hidden = true;
    opener?.focus({ preventScroll: true });
    atlas.querySelector('.atlas-layout').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }

  document.getElementById('atlas-back').addEventListener('click', backToMap);
  previous.addEventListener('click', () => showStory(activeStory - 1, 'smooth'));
  next.addEventListener('click', () => showStory(activeStory + 1, 'smooth'));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'Escape') backToMap();
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showStory(activeStory + (event.key === 'ArrowRight' ? 1 : -1), 'smooth');
  });

  function nearestStory() {
    const left = track.getBoundingClientRect().left;
    return stories.reduce((best, story, index) =>
      Math.abs(story.getBoundingClientRect().left - left) <
      Math.abs(stories[best].getBoundingClientRect().left - left) ? index : best, 0);
  }

  track.addEventListener('scroll', () => {
    if (!drag) setActive(nearestStory());
  }, { passive: true });

  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button')) return;
    drag = { x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.setAttribute('data-dragging', '');
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  track.addEventListener('lostpointercapture', () => {
    if (!drag) return;
    drag = null;
    const index = nearestStory();
    track.removeAttribute('data-dragging');
    showStory(index, 'smooth');
  });
})();
