import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router';

import HomePage from './assets/components/HomePage.jsx';
import Dashboard from './assets/components/Dashboard.jsx';
import Carousel from './assets/components/SideBar/SidebarElements/Carousel.jsx';
import Testimonial from './assets/components/SideBar/SidebarElements/Testimonial.jsx';
import PromotionalOffers from './assets/components/SideBar/SidebarElements/PromotionalOffers.jsx';
import Attorney from './assets/components/SideBar/SidebarElements/Attorney.jsx';
import Work from './assets/components/SideBar/SidebarElements/Work.jsx';
import ContactUs from './assets/components/SideBar/SidebarElements/ContactUs.jsx';
import LoginPage from './assets/components/Login/LoginPage.jsx';
import ProtectedRoute from './assets/components/auth/ProtectedRoute.jsx';
import { AuthProvider } from './assets/components/auth/AuthProvider.jsx';
import VideoAdmin from './assets/components/SideBar/SidebarElements/VideoAdmin.jsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <HomePage />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'carousel', element: <Carousel /> },
          { path: 'testimonial', element: <Testimonial /> },
          { path: 'promotions', element: <PromotionalOffers /> },
          { path: 'videoAdmin', element: <VideoAdmin /> },
          { path: 'attorney', element: <Attorney /> },
          { path: 'work', element: <Work /> },
          { path: 'contact', element: <ContactUs /> },
        ]
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
