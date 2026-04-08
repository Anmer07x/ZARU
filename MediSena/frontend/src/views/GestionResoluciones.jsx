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
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Home,
  Copy,
  FileText,
  Bell
} from 'lucide-react';
import '../styles/GestionResoluciones.css';

const GestionResoluciones = () => {
  const [resoluciones, setResoluciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Resoluciones');
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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
        setCurrentPage(1); // Reset page on tab change
      }
    };

    fetchData();
  }, [activeTab]);

  // Combined filtering logic
  const filteredData = useMemo(() => {
    const data = activeTab === 'Resoluciones' ? resoluciones : activeTab === 'Usuarios' ? usuarios : [];
    
    return data.filter(item => {
      // Search matching
      const matchesSearch = activeTab === 'Resoluciones' 
        ? (item.numero.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
        : (item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status matching
      const matchesStatus = statusFilter === '' || statusFilter === 'Seleccionar estado' 
        ? true 
        : item.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, resoluciones, usuarios, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteClick = (item) => {
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

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="gestion-container">
          {/* Breadcrumbs */}
          <header className="gestion-header">
            <div>
              <nav className="breadcrumb">
                <div className="breadcrumb-item">
                  <Home size={14} className="home-icon" />
                </div>
                <div className="breadcrumb-item">
                  <ChevronRight size={14} />
                  Maestras
                </div>
                <div className="breadcrumb-item active">
                  <ChevronRight size={14} />
                  {activeTab}
                </div>
              </nav>
              <h1 className="gestion-title">Gestión de {activeTab}</h1>
            </div>
            
            <div className="header-right-actions">
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
                  <Search size={18} />
                </button>
              </div>
              <div style={{ marginLeft: '10px' }}>
                <Bell size={24} color="#F59E0B" fill="#F59E0B" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </header>


          <div className="gestion-content-card">

            {/* Tabs DENTRO del cuadro blanco — igual que el Figma */}
            <div className="tabs-scroll-area">
              {tabs.map(tab => (
                <div 
                  key={tab} 
                  className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <div className="active-tab-icon">
                      <FileText size={16} />
                    </div>
                  )}
                  {tab}
                </div>
              ))}
            </div>

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
                <Plus size={20} />
                Nueva {activeTab === 'Resoluciones' ? 'Resolución' : 'Entrada'}
              </button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="resoluciones-table">
                <thead>
                  {activeTab === 'Resoluciones' ? (
                    <tr>
                      <th>N° <ArrowUpDown size={14} className="sort-icon" /></th>
                      <th>FECHA <ArrowUpDown size={14} className="sort-icon" /></th>
                      <th>DESCRIPCIÓN</th>
                      <th>ESTADO</th>
                      <th>VIGENCIA</th>
                      <th style={{ textAlign: 'right' }}></th>
                    </tr>
                  ) : activeTab === 'Usuarios' ? (
                    <tr>
                      <th>ID <ArrowUpDown size={14} className="sort-icon" /></th>
                      <th>NOMBRE <ArrowUpDown size={14} className="sort-icon" /></th>
                      <th>ROL</th>
                      <th>EMAIL</th>
                      <th style={{ textAlign: 'right' }}></th>
                    </tr>
                  ) : (
                    <tr>
                      <th colSpan="5">Mantenimiento de {activeTab}</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}>Cargando datos...</td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    activeTab === 'Resoluciones' ? (
                      currentItems.map(res => (
                        <tr key={res.id}>
                          <td style={{ fontWeight: '800', color: '#1C3E57' }}>{res.numero}</td>
                          <td style={{ fontWeight: '600' }}>{res.fecha}</td>
                          <td>
                            <div className="desc-with-icon">
                              {res.descripcion}
                              <Copy size={16} className="copy-icon" />
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${res.estado.toLowerCase()}`}>
                              <div className={`status-dot ${res.estado.toLowerCase()}`}></div>
                              {res.estado}
                            </span>
                          </td>
                          <td style={{ fontWeight: '500' }}>{res.vigencia}</td>
                          <td>
                            <div className="row-actions">
                              <button className="icon-btn edit">
                                <Edit2 size={18} />
                              </button>
                              <button 
                                className="icon-btn delete"
                                onClick={() => handleDeleteClick(res)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : activeTab === 'Usuarios' ? (
                      currentItems.map(user => (
                        <tr key={user.id}>
                          <td style={{ color: '#1C3E57', fontWeight: '800' }}>{user.id}</td>
                          <td style={{ fontWeight: '700', color: '#1C3E57' }}>{user.nombre}</td>
                          <td>{user.rol}</td>
                          <td>{user.email}</td>
                          <td>
                            <div className="row-actions">
                              <button className="icon-btn edit">
                                <Edit2 size={18} />
                              </button>
                              <button 
                                className="icon-btn delete"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '60px' }}>Sin datos.</td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#A0B3C5' }}>
                        No se encontraron resultados para tu búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-footer">
              <div className="items-per-page">
                <span>Elementos por página</span>
                <div className="items-select-wrapper">
                  <select 
                    className="items-select"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="page-controls">
                <button 
                  className="page-link nav"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </div>
                ))}
                <button 
                  className="page-link nav"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="page-info-total">
                {currentPage} - de {totalPages} páginas
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon-container">
                <Trash2 size={28} />
              </div>
              <h2 className="modal-title">¿Quieres eliminar esta Resolución?</h2>
              <p className="modal-description">
                Esta acción eliminará la resolución de <strong>forma permanente</strong> y no podrás recuperarla después.
              </p>
              <div className="modal-actions">
                <button 
                  className="btn-modal btn-cancel"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-modal btn-delete"
                  onClick={confirmDelete}
                >
                  <Trash2 size={18} />
                  Eliminar Resolución
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GestionResoluciones;
