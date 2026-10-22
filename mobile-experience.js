/* MOBILE ACCOUNT MENU START */
(()=>{
 const bar=document.querySelector('.topbar-right');if(!bar)return;
 const nodes=['userInfo','logoutBtn','themeToggle'].map(id=>document.getElementById(id)).filter(Boolean);
 const places=nodes.map(n=>{const marker=document.createComment('mobile-menu-anchor');n.before(marker);return marker;});
 const menu=document.createElement('details');menu.className='mobile-account-menu';
 const summary=document.createElement('summary');summary.textContent='메뉴';summary.setAttribute('aria-label','계정 및 화면 설정');
 const panel=document.createElement('div');panel.className='mobile-account-panel';menu.append(summary,panel);bar.append(menu);
 const mq=matchMedia('(max-width:600px)');
 const sync=()=>{menu.open=false;if(mq.matches)nodes.forEach(n=>panel.append(n));else nodes.forEach((n,i)=>places[i].after(n));};
 mq.addEventListener('change',sync);sync();
 document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;summary.focus();}});
 panel.addEventListener('click',e=>{if(e.target.closest('#logoutBtn'))menu.open=false;});
})();
/* MOBILE ACCOUNT MENU END */