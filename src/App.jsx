import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "https://paselista-back.onrender.com";

function App() {
  const [rol, setRol] = useState('alumno');
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [alumnoDetalle, setAlumnoDetalle] = useState(null);
  const [misAsistencias, setMisAsistencias] = useState([]);
  const [reporteProfesor, setReporteProfesor] = useState([]);

  useEffect(() => {
    cargarAlumnos();
    if (rol === 'profesor') cargarReporte();
  }, [rol]);

  const cargarAlumnos = () => axios.get(`${API_URL}/alumnos`).then(res => setAlumnos(res.data));
  const cargarReporte = () => axios.get(`${API_URL}/reporte-profesor`).then(res => setReporteProfesor(res.data));

  const registrarAlumno = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    axios.post(`${API_URL}/alumnos`, { nombre: nuevoNombre }).then(() => {
      setNuevoNombre("");
      cargarAlumnos();
    });
  };

  const eliminarAlumno = (id, event) => {
    event.stopPropagation(); 
    axios.delete(`${API_URL}/alumnos/${id}`).then(() => {
      cargarAlumnos();
      if (alumnoDetalle && alumnoDetalle.id === id) {
        setAlumnoDetalle(null);
      }
    });
  };

  const verDetalles = (alumno) => {
    setAlumnoDetalle(alumno);
    axios.get(`${API_URL}/materias`).then(res => setMaterias(res.data));
    axios.get(`${API_URL}/asistencias/${alumno.id}`).then(res => setMisAsistencias(res.data));
  };

  const pasarAsistencia = (materiaId) => {
    axios.post(`${API_URL}/asistencia`, { alumnoId: alumnoDetalle.id, materiaId })
      .then(() => {
        axios.get(`${API_URL}/asistencias/${alumnoDetalle.id}`).then(res => {
          setMisAsistencias(res.data);
        });
      });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      
      
      <header style={{ backgroundColor: '#ffffff', color: '#333', padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#2c3e50' }}>Registros de asistencia</h1>
      </header>

    
      <div style={{ textAlign: 'center', margin: '25px 0' }}>
        <button style={navBtn(rol === 'alumno')} onClick={() => {setRol('alumno'); setAlumnoDetalle(null)}}>VISTA ALUMNOS</button>
        <button style={navBtn(rol === 'profesor')} onClick={() => setRol('profesor')}>VISTA PROFESOR</button>
      </div>

      
      <main style={{ flex: 1, padding: '20px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {rol === 'alumno' ? (
          !alumnoDetalle ? (
            <div>
              <form onSubmit={registrarAlumno} style={{ marginBottom: '30px' }}>
                <input 
                  style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
                  value={nuevoNombre} 
                  onChange={(e) => setNuevoNombre(e.target.value)} 
                  placeholder="Nombre completo del alumno..." 
                />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Registrar</button>
              </form>

              <table width="100%" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#fdfdfd' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Nombre</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{a.nombre}</td>
                      <td style={{ textAlign: 'right', padding: '12px' }}>
                        <button onClick={() => verDetalles(a)} style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginRight: '15px' }}>Detalles</button>
                        <button onClick={(e) => eliminarAlumno(a.id, e)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar 🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <button onClick={() => setAlumnoDetalle(null)} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}>⬅ Regresar a la lista</button>
              <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#2c3e50' }}>Expediente: {alumnoDetalle.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
                <div>
                  <h3>Materias disponibles</h3>
                  {materias.map(m => (
                    <div key={m.id} style={{ marginBottom: '10px', padding: '15px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '5px' }}>
                      <span><strong>{m.nombre}</strong></span>
                      <button onClick={() => pasarAsistencia(m.id)} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Pasar Lista ✅</button>
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <h3>Asistencias de hoy</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {misAsistencias.length === 0 ? <p style={{ color: '#888' }}>Sin asistencias registradas.</p> : null}
                    {misAsistencias.map(as => (
                      <div key={as.id} style={{ padding: '8px 0', borderBottom: '1px dotted #ccc', fontSize: '14px' }}>
                        <strong>{as.materia}</strong> - {as.fechaHora}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div>
            <h2>Reporte General - Administración</h2>
            <table width="100%" border="1" style={{ borderCollapse: 'collapse', borderColor: '#ddd', marginTop: '15px' }}>
              <thead style={{ backgroundColor: '#f2f2f2' }}>
                <tr>
                  <th style={{ padding: '10px' }}>Alumno</th>
                  <th style={{ padding: '10px' }}>Materia</th>
                  <th style={{ padding: '10px' }}>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                {reporteProfesor.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No hay registros de asistencias por el momento.</td></tr>
                ) : (
                  reporteProfesor.map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '10px' }}>{r.alumnoNombre}</td>
                      <td style={{ padding: '10px' }}>{r.materia}</td>
                      <td style={{ padding: '10px' }}>{r.fechaHora}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      
      <footer style={{ backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center', borderTop: '4px solid #3498db', fontSize: '13px', color: '#666' }}>
        <p style={{ margin: '5px 0' }}>Sistema de Control de Asistencias Escolar</p>
        <p style={{ margin: '5px 0' }}>© 2026 Universidad - Todos los derechos reservados</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
          <span>Privacidad</span>
          <span>Soporte Técnico</span>
          <span>Contacto</span>
        </div>
      </footer>
    </div>
  );
}

const navBtn = (active) => ({
  padding: '10px 25px',
  margin: '0 8px',
  cursor: 'pointer',
  backgroundColor: active ? '#2c3e50' : '#bdc3c7',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
});

export default App;