
const routes = [
  { path: '/',component: ()=> import ('./components/home.js') },
  { path: '/login', component : ()=> import ('./components/login.js') ,name: "Login"},
  { path: '/stats', component : ()=> import ('./components/stats.js'),name: "stats"},
  { path: '/find', component : ()=> import ('./components/find.js'),name: "find"},
  { path: '/requests', component : ()=> import ('./components/requests.js'),name: "requests"},
  { path: '/yourcampaigns', component : ()=> import ('./components/campaigns.js'),name:"yourcampaigns"},
  { path: '/viewcampaign/:campaign', component : ()=> import ('./components/view_campaign.js'),name:"viewcampaign",props:true}
]


const router=VueRouter.createRouter({
  history: VueRouter.createWebHistory('/'),
  routes,
})

export default router

