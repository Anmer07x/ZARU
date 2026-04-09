import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  ChevronRight,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ArrowUpDown,
  Home,
  Copy,
  FileText,
  Bell
} from 'lucide-react';
import '../styles/GestionResoluciones.css';

export interface Resolucion {
  id: number;
  numero: string;
  fecha: string;
  descripcion: string;
  estado: string;
  vigencia: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  email: string;
}

const GestionResoluciones: React.FC = () => {
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Resoluciones');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const tabs = [
    'Resoluciones', 'Usuarios', 'Niveles', 'Topes',
    'Parentescos', 'Abrir vigencia', 'Parámetros', 'Sub-especialidades'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Resoluciones') {
          const res = await api.get('/resoluciones');
          setResoluciones(res.data);
        } else if (activeTab === 'Usuarios') {
          const res = await api.get('/usuarios');
          setUsuarios(res.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };
    fetchData();
  }, [activeTab]);

  const filteredData = useMemo(() => {
    const data = activeTab === 'Resoluciones' ? resoluciones : activeTab === 'Usuarios' ? usuarios : [];
    return data.filter((item: any) => {
      const matchesSearch = activeTab === 'Resoluciones'
        ? (item.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()))
        : (item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === '' || statusFilter === 'Seleccionar estado'
        ? true
        : item.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, resoluciones, usuarios, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (activeTab === 'Resoluciones') {
      setResoluciones(resoluciones.filter(r => r.id !== itemToDelete.id));
    } else {
      setUsuarios(usuarios.filter(u => u.id !== itemToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  /* Páginas visibles: máx 5 alrededor de la actual */
  const visiblePages = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="gestion-container">

          {/* ── Header ── */}
          <header className="gestion-header">
            {/* Fila 1: breadcrumb | campana */}
            <div className="gestion-header-top">
              <nav className="breadcrumb">
                <div className="breadcrumb-item"><Home size={14} /></div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item">Maestras</div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item active">{activeTab}</div>
              </nav>
              <Bell size={26} color="#F59E0B" fill="#F59E0B" style={{ cursor: 'pointer', flexShrink: 0 }} />
            </div>

            {/* Fila 2: título | búsqueda */}
            <div className="gestion-header-bottom">
              <h1 className="gestion-title">Gestión de {activeTab}</h1>
              <div className="search-wrapper">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Busca el nombre de usuario o radicado"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="search-btn">
                  <Search size={17} />
                </button>
              </div>
            </div>
          </header>

          {/* ── Tabs + Card agrupados (sin gap entre ellos) ── */}
          <div className="tabs-card-group">
            <div className="tabs-scroll-area">
              {tabs.map(tab => (
                <div
                  key={tab}
                  className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <div className="active-tab-icon">
                      <FileText size={14} />
                    </div>
                  )}
                  {tab}
                </div>
              ))}
            </div>

            {/* ── Card principal ── */}
            <div className="gestion-content-card">

              {/* Toolbar */}
              <div className="content-toolbar">
                <div className="stat-filter-container">
                  <select
                    className="stat-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>Seleccionar estado</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
                <button className="btn-new-resolution">
                  <Plus size={18} />
                  Nueva {activeTab === 'Resoluciones' ? 'Resolución' : 'Entrada'}
                </button>
              </div>

              {/* Tabla */}
              <div className="table-wrapper">
                <table className="resoluciones-table">
                  <thead>
                    {activeTab === 'Resoluciones' ? (
                      <tr>
                        <th>N° <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>FECHA <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>DESCRIPCIÓN</th>
                        <th>ESTADO</th>
                        <th>VIGENCIA</th>
                        <th></th>
                      </tr>
                    ) : activeTab === 'Usuarios' ? (
                      <tr>
                        <th>ID <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>NOMBRE <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>ROL</th>
                        <th>EMAIL</th>
                        <th></th>
                      </tr>
                    ) : (
                      <tr><th colSpan={5}>Mantenimiento de {activeTab}</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="table-empty">Cargando datos...</td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      activeTab === 'Resoluciones' ? (
                        (currentItems as Resolucion[]).map(res => (
                          <tr key={res.id}>
                            <td className="col-numero">{res.numero}</td>
                            <td className="col-fecha">{res.fecha}</td>
                            <td>
                              <div className="desc-with-icon">
                                {res.descripcion}
                                <Copy size={15} className="copy-icon" />
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${res.estado.toLowerCase()}`}>
                                <div className={`status-dot ${res.estado.toLowerCase()}`}></div>
                                {res.estado}
                              </span>
                            </td>
                            <td className="col-vigencia">{res.vigencia}</td>
                            <td>
                              <div className="row-actions">
                                <button className="icon-btn edit"><Edit2 size={16} /></button>
                                <button className="icon-btn delete" onClick={() => handleDeleteClick(res)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'Usuarios' ? (
                        (currentItems as Usuario[]).map(user => (
                          <tr key={user.id}>
                            <td className="col-numero">{user.id}</td>
                            <td className="col-fecha">{user.nombre}</td>
                            <td>{user.rol}</td>
                            <td>{user.email}</td>
                            <td>
                              <div className="row-actions">
                                <button className="icon-btn edit"><Edit2 size={16} /></button>
                                <button className="icon-btn delete" onClick={() => handleDeleteClick(user)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="table-empty">Sin datos.</td></tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-empty">No se encontraron resultados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="pagination-footer">
                <div className="items-per-page">
                  <span>Elementos por página</span>
                  <div className="items-select-wrapper">
                    <select
                      className="items-select"
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="page-controls">
                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {visiblePages.map(n => (
                    <button
                      key={n}
                      className={`page-num-btn ${currentPage === n ? 'active' : ''}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="page-info-total">
                  {currentPage} - de {totalPages} páginas
                </div>
              </div>
            </div>
          </div>

          {/* Modal eliminar */}
          {isDeleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-icon-container">
                  <Trash2 size={26} />
                </div>
                <h2 className="modal-title">¿Quieres eliminar esta Resolución?</h2>
                <p className="modal-description">
                  Esta acción eliminará la resolución de <strong>forma permanente</strong> y no podrás recuperarla después.
                </p>
                <div className="modal-actions">
                  <button className="btn-modal btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancelar
                  </button>
                  <button className="btn-modal btn-delete" onClick={confirmDelete}>
                    <Trash2 size={16} />
                    Eliminar Resolución
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GestionResoluciones;