// 輕快愉悅的無版權原創島嶼冒險合成音樂（Web Audio API）
export function setupMusic({button,slider,output,audio,initialVolume=.35,onVolume=()=>{},onError=()=>{}}){
 let context=null,gain=null,timer=null,busy=false,level=.35;
 function sync(){const playing=!!context||!audio.paused;button.textContent=playing?'♫ 關閉音樂':'♫ 開啟音樂';button.setAttribute('aria-pressed',String(playing));}
 function volume(value){level=Math.max(0,Math.min(1,Number.isFinite(Number(value))?Number(value):.35));audio.volume=level;if(gain)gain.gain.value=level*.22;slider.value=String(Math.round(level*100));output.textContent=slider.value+'%';slider.setAttribute('aria-valuetext',slider.value+'%');return level;}
 volume(initialVolume);slider.addEventListener('input',()=>onVolume(volume(Number(slider.value)/100)));audio.addEventListener('play',sync);audio.addEventListener('pause',sync);audio.addEventListener('error',()=>{audio.pause();sync();onError('音樂載入失敗，請檢查音訊檔案與網路。');});

 // 32 拍 C 大調輕快明亮冒險旋律與和弦伴奏（132 BPM）
 const melody=[
  523.25,659.25,783.99,659.25, 880.00,783.99,659.25,523.25,
  587.33,659.25,698.46,783.99, 659.25,587.33,523.25,0,
  659.25,783.99,1046.50,880.00, 783.99,659.25,698.46,783.99,
  880.00,783.99,659.25,587.33, 523.25,659.25,523.25,0
 ];
 const bass=[
  130.81,0,196.00,0, 174.61,0,130.81,0,
  196.00,0,146.83,0, 130.81,0,196.00,0,
  220.00,0,164.81,0, 174.61,0,130.81,0,
  146.83,0,196.00,0, 130.81,0,130.81,0
 ];
 const chords=[
  [261.63,329.63],[196.00,246.94],[220.00,261.63],[174.61,220.00],
  [261.63,329.63],[174.61,220.00],[196.00,293.66],[261.63,329.63]
 ];

 function pluck(freq,dur,vol,type='triangle',attack=.012){
  if(!context||!gain||!freq)return;
  const t=context.currentTime,osc=context.createOscillator(),env=context.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,t);
  env.gain.setValueAtTime(.0001,t);
  env.gain.linearRampToValueAtTime(vol,t+attack);
  env.gain.exponentialRampToValueAtTime(.0008,t+dur);
  osc.connect(env).connect(gain);osc.start(t);osc.stop(t+dur+.03);
 }

 return {async toggle(){if(busy)return;busy=true;button.disabled=true;try{if(context){clearInterval(timer);await context.close();context=null;gain=null;}else if(!audio.paused)audio.pause();else if(audio.getAttribute('src'))await audio.play();else {context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();gain=context.createGain();gain.gain.value=level*.22;gain.connect(context.destination);let step=0;const tick=()=>{const idx=step++%melody.length;pluck(melody[idx],.34,.45,'triangle',.01);if(melody[idx])pluck(melody[idx]*2,.18,.12,'sine',.008);if(bass[idx])pluck(bass[idx],.42,.36,'sine',.015);if(idx%4===2){const c=chords[Math.floor(idx/4)%chords.length];c.forEach(f=>pluck(f,.26,.14,'sine',.01));}};tick();timer=setInterval(tick,227);}}catch{clearInterval(timer);if(context)await context.close().catch(()=>{});context=null;audio.pause();onError('此瀏覽器暫時無法播放音樂，請再按一次或檢查音訊權限。');}finally{busy=false;button.disabled=false;sync();}}};
}
