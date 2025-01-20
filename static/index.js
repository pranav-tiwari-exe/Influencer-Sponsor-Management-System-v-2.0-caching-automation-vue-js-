import router from './router.js'

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token'); 

  if (to.name !== 'Login' && !isLoggedIn) {
    next({ name: 'Login' });
  } 
  else {
    next();
  }
});

const app = Vue.createApp({
  template: `<div>
               <router-view></router-view>
             </div>`,
})

app.use(router)

app.mount('#app')
