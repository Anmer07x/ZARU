import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import {
  DashboardIcon,
  MaestrasIcon,
  DatosBasicosIcon,
  MovimientosIcon,
  ExcedentesIcon,
  ConsultasIcon,
  ReportesIcon,
  ReportesNacionalesIcon
} from './SidebarIcons';
import '../styles/Sidebar.css';

import logo from '../assets/img/Sidebar.png';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'Dashboard', icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { id: 'Gestion', icon: MaestrasIcon, label: 'Gestión', path: '/gestion' },
    { id: 'Datos básicos', icon: DatosBasicosIcon, label: 'Datos básicos', path: '/datos-basicos' },
    { id: 'Movimientos', icon: MovimientosIcon, label: 'Movimientos', path: '/movimientos' },
    { id: 'Excedentes', icon: ExcedentesIcon, label: 'Excedentes', path: '/excedentes' },
    { id: 'Consultas', icon: ConsultasIcon, label: 'Consultas', path: '/consultas' },
    { id: 'Reportes', icon: ReportesIcon, label: 'Reportes', path: '/reportes' },
    { id: 'Reportes nacionales', icon: ReportesNacionalesIcon, label: 'Reportes nacionales', path: '/reportes-nacionales' },
  ];

  useEffect(() => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) setActiveItem(currentItem.id);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu size={22} />
      </button>

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={22} />
        </button>

        {/* Botón de retraer menú en la parte superior derecha */}
        <button className="desktop-collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          {!isCollapsed && <img src={logo} alt="MediSENA Logo" />}
          {isCollapsed && <span className="logo-collapsed-text">MS</span>}
        </div>

        {/* Navegación */}
        <nav className="nav-container">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveItem(item.id);
                  navigate(item.path);
                }}
              >
                <item.icon className="nav-item-icon" />
                <span className="nav-item-text">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Perfil */}
        <div className="user-profile-section">
          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Paula" alt="Paula" />
              </div>
              {!isCollapsed && (
                <div className="profile-text">
                  <span className="profile-name">Paula<br />Chaparro</span>
                </div>
              )}
            </div>
            <button className="logout-button" onClick={handleLogout} title="Cerrar sesión">
              <LogOut size={isCollapsed ? 18 : 14} style={{ margin: isCollapsed ? '0 auto' : '0' }} />
              {!isCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
