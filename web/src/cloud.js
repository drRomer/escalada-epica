// Nube de Escalada Épica: Firebase Auth (Google) + Firestore Lite, en el mismo proyecto de la saga (Sendero del Orbe).
// Un documento por jugador: escalada/{uid} = {v, d:{progreso}, pt, t}. Sin nombre ni correo en la base.
// La interfaz está dentro del lienzo del juego (menú NUBE); este módulo expone window.EE_CLOUD.
import {initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,onAuthStateChanged,signOut,deleteUser,reauthenticateWithPopup} from 'firebase/auth';
import {getFirestore,doc,getDoc,setDoc,deleteDoc,serverTimestamp} from 'firebase/firestore/lite';
import {createSync,maskEmail,ago,errText} from './cloud-core.js';

const CFG=window.EE_FIREBASE, EE=window.EE;
const configured=c=>!!c&&typeof c==='object'&&/^AIza[0-9A-Za-z_-]{20,}$/.test(c.apiKey||'')&&/^[a-z0-9-]{4,40}$/.test(c.projectId||'')&&typeof c.appId==='string'&&c.appId.length>5;
const CANCEL=['auth/popup-closed-by-user','auth/cancelled-popup-request','auth/user-cancelled'];

function start(){
  const app=initializeApp({apiKey:CFG.apiKey,authDomain:CFG.authDomain||CFG.projectId+'.firebaseapp.com',projectId:CFG.projectId,appId:CFG.appId,messagingSenderId:CFG.messagingSenderId});
  const auth=getAuth(app);auth.languageCode='es';
  const db=getFirestore(app);
  const prov=new GoogleAuthProvider();prov.setCustomParameters({prompt:'select_account'});
  const backend={
    async load(uid){const s=await getDoc(doc(db,'escalada',uid));if(!s.exists())return null;const x=s.data()||{};return {d:x.d||{},pt:Number(x.pt)||0};},
    async save(uid,{d,pt}){await setDoc(doc(db,'escalada',uid),{v:1,d,pt,t:serverTimestamp()});},
    async remove(uid){await deleteDoc(doc(db,'escalada',uid));}
  };
  let user=null,st={status:'off'},busy='';
  const sync=createSync({sdo:EE,backend,onState:s=>{st=s;}});
  EE.onChange(()=>sync.schedule());
  const report=c=>{if(c==='cloud')EE.toast('Progreso recuperado de la nube',3200);else if(c==='new')EE.toast('Tu progreso quedó respaldado en la nube',3000);};

  onAuthStateChanged(auth,async u=>{user=u?{uid:String(u.uid),email:u.email||''}:null;report(await sync.setUser(user&&user.uid));});
  let redir=false;try{redir=sessionStorage.getItem('ee_redir')==='1';sessionStorage.removeItem('ee_redir');}catch(e){}
  getRedirectResult(auth).then(r=>{if(redir&&!r&&!auth.currentUser)EE.toast('No se pudo completar el inicio con Google desde la app instalada. Usa COPIAR / PEGAR CÓDIGO, o entra desde Safari.',5200);})
    .catch(()=>EE.toast('No se pudo iniciar sesión con Google. Prueba con COPIAR / PEGAR CÓDIGO.',4200));

  window.EE_CLOUD={
    user:()=>user,
    info(){
      if(busy)return {text:busy};
      if(!user)return {text:'Sin conectar: tu progreso está solo en este dispositivo.'};
      const who=maskEmail(user.email);
      if(st.status==='sync')return {text:'Sincronizando · '+who};
      if(st.status==='err')return {text:errText(st.err)+' · '+who,err:true};
      return {text:'Conectada: '+who+(st.lastOk?' · guardado '+ago(st.lastOk):''),ok:true};
    },
    async login(){
      if(busy)return;
      if(navigator.standalone===true){   // app instalada en iPhone: la ventana de Google no puede devolver el resultado
        busy='Abriendo Google…';try{sessionStorage.setItem('ee_redir','1');}catch(e){}
        try{await sync.flush();}catch(e){}
        try{await signInWithRedirect(auth,prov);}catch(e){busy='';EE.toast(errText(e),3200);}
        return;
      }
      busy='Abriendo Google…';
      // si la ventana de Google nunca aparece (bloqueada), no dejar el menú pegado
      const guard=setTimeout(()=>{if(busy==='Abriendo Google…'){busy='';EE.toast('No se abrió la ventana de Google. Toca CONECTAR otra vez; si no aparece, permite ventanas emergentes para este sitio.',4200);}},12000);
      try{await signInWithPopup(auth,prov);}
      catch(e){
        if(e&&['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e.code)){busy='';await signInWithRedirect(auth,prov);return;}
        if(!CANCEL.includes(e&&e.code))EE.toast(errText(e),3200);
      }
      clearTimeout(guard);busy='';
    },
    async logout(){try{await sync.flush();}catch(e){} try{await signOut(auth);EE.toast('Sesión cerrada',2200);}catch(e){EE.toast(errText(e));}},
    async wipe(){
      busy='Borrando…';
      try{
        await sync.wipe();
        const u=auth.currentUser;let full=true;
        if(u){try{await deleteUser(u);}catch(e){full=false;if(e&&e.code==='auth/requires-recent-login'){try{await reauthenticateWithPopup(u,prov);await deleteUser(u);full=true;}catch(e2){}}if(!full)await signOut(auth);}}
        EE.toast(full?'Tus datos de la nube fueron eliminados':'Copia eliminada. Para cerrar la cuenta, entra de nuevo y repite.',3800);
      }catch(e){EE.toast(errText(e),3600);}
      busy='';
    }
  };
  window.addEventListener('focus',()=>{if(busy==='Abriendo Google…')setTimeout(()=>{if(busy==='Abriendo Google…'&&!user)busy='';},1500);});
  const again=async()=>{if(user)report(await sync.resync());};
  window.addEventListener('online',again);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sync.flush();else again();});
  window.addEventListener('pagehide',()=>sync.flush());
}
if(EE&&configured(CFG))start();
