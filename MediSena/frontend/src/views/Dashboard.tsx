import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  Users,
  Calendar,
  FileText,
  UserPlus,
  Loader2,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Stethoscope,
  User,
  Clock
} from 'lucide-react';
import '../App.css';
import '../styles/Dashboard.css';

export interface Cita {
  id: number | string;
  medico: string;
  beneficiario: string;
  hora: string;
}

export interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

export interface CitaCardProps {
  cita: Cita;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = 13;

  const getFormattedDate = () => {
    const parts = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).split(' ');
    if (parts.length > 2) {
      parts[2] = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    }
    return parts.join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, citasRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/citas')
        ]);
        setStats(statsRes.data);
        setCitas(citasRes.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={48} color="#1C3E57" />
      </div>
    );
  }

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">

        {/* ── Header ── */}
        <header className="dashboard-header">
          <div className="header-title-container">
            <div className="sun-icon-container">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#1C3E57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </div>
            <div>
              <h1 className="header-title">Buenos días, Paula Andrea</h1>
              <p className="header-date">{getFormattedDate()}</p>
            </div>
          </div>
          <div className="notification-bell">
            <Bell size={20} color="#EFA00B" fill="#F4B41A" />
            <div className="notification-dot"></div>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="stats-grid">
          <StatCard
            title="Beneficiarios activos"
            value="14.623"
            subtitle="Beneficiarios activos"
            icon={<Users size={16} />}
          />
          <StatCard
            title="Citas programadas"
            value="1'144.146"
            subtitle="0 hoy"
            icon={<Calendar size={16} />}
          />
          <StatCard
            title="Órdenes médicas"
            value="3'155.732"
            subtitle="687.646 cuentas de cobro"
            icon={<FileText size={16} />}
          />
          <StatCard
            title="Profesionales"
            value="232"
            subtitle="6493 contratistas"
            icon={<UserPlus size={16} />}
          />
        </div>

        {/* ── Título Citas (FUERA del contenedor blanco) ── */}
        <div className="citas-header">
          <div className="citas-header-icon">
            <Calendar size={15} color="white" />
          </div>
          <h2 className="citas-title">Citas programadas</h2>
        </div>

        {/* ── Citas Section (solo cards + paginación) ── */}
        <section className="citas-section">
          <div className="citas-list">
            {citas.map(cita => (
              <CitaCard key={cita.id} cita={cita} />
            ))}
          </div>

          {/* Paginación */}
          <div className="pagination">
            <div className="pagination-left">
              <span>Elementos por página</span>
              <select
                className="page-select"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="pagination-center">
              <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft size={12} />
              </button>
              <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft size={12} />
              </button>
              {pageNumbers.map(n => (
                <button
                  key={n}
                  className={`page-btn${currentPage === n ? ' active-page-btn' : ''}`}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight size={12} />
              </button>
              <button className="page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                <ChevronsRight size={12} />
              </button>
            </div>

            <div className="pagination-right">
              {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalPages * pageSize)} de {totalPages} Páginas
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <span className="stat-value">{value}</span>
      <span className="stat-subtitle">{subtitle}</span>
    </div>
    <div className="stat-decoration"></div>
  </div>
);

const CitaCard: React.FC<CitaCardProps> = ({ cita }) => (
  <div className="cita-card">
    <div className="cita-content">
      <div className="cita-top">
        <h3 className="cita-type">Consulta médica</h3>
        <span className="active-badge">
          <div className="badge-dot"></div>
          Activo
        </span>
      </div>
      <div className="cita-details">
        <div className="detail-item">
          <Stethoscope size={14} color="#1C3E57" />
          <span className="detail-label">Médico:</span>
          <span className="detail-value">{cita.medico}</span>
        </div>
        <div className="detail-item">
          <User size={14} color="#1C3E57" />
          <span className="detail-label">Beneficiario:</span>
          <span className="detail-value">{cita.beneficiario}</span>
        </div>
        <div className="detail-item">
          <Clock size={14} color="#1C3E57" />
          <span className="detail-label">Hora de la consulta:</span>
          <span className="detail-value">{cita.hora}</span>
        </div>
      </div>
    </div>
    <div className="cita-decoration"></div>
  </div>
);

export default Dashboard;