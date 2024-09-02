import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CanvasPage from './pages/CanvasPage.tsx'
import Keycloak from 'keycloak-js';
import { initializeApiInterceptors } from './app/api.ts'
import { store } from './app/store.ts'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT,
});

keycloak.init({
  onLoad: 'login-required',
}).then((authenticated) => {
  if (authenticated) {
    // console.log('User is authenticated');
    const token = keycloak.token;
    // console.log('Access Token:', token);
    if (token) {
      initializeApiInterceptors(store, token);
    }
  } else {
    console.log('User is not authenticated!');
  }
}).catch((error) => {
  console.error('Keycloak initialization failed:', error);
});


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "",
        element: <CanvasPage/>
      }
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
