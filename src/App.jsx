import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DaftarArsip from './pages/DaftarArsip';
import FormArsip from './pages/FormArsip';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ManageUsers from './pages/ManageUsers';
import ManageBoxes from './pages/ManageBoxes';
import Denah from'./pages/DenahArsipPage';
import ProfileSettings from './pages/ProfileSettings';
import AddBox from './pages/AddBox';
import EditArsip from './pages/EditArsip';
import EditBox from './pages/EditBox';
import ScrollToTop from './components/ScrollToTop';
import ShowArsip from './pages/ShowArsip';
import ShowBox from './pages/ShowBox';

function App() {
  return (
    <AuthProvider> 
      <Router>
        
        <ScrollToTop />
        
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* route untuk profile settings */}
          <Route path="/profile" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <ProfileSettings />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* route untuk edit arsip */}
          <Route path="/edit-arsip/:id" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator']}>   
              <MainLayout>
                <EditArsip />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* route untuk lihat detail arsip */}
          <Route path="/show-arsip/:id" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>   
              <MainLayout>
                <ShowArsip />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* route untuk edit box */}
          <Route path="/edit-box/:id" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator']}>
              <MainLayout>
                <EditBox />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* route untuk lihat detail box */}
          <Route path="/show-box/:id" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <ShowBox />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/arsip" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <DaftarArsip />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* route untuk tambah box */}
          <Route path="/add-box" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator']}>
              <MainLayout>
                <AddBox />
              </MainLayout>
            </ProtectedRoute>
          } />

         {/* route untuk denah arsip */}
          <Route path="/denah" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <Denah />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Dashboard Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Manajemen Box */}
          <Route path="/boxes" element={
            <ProtectedRoute allowRoles={['super_admin', 'operator', 'viewer']}>
              <MainLayout>
                <ManageBoxes />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Manajemen Users/Pegawai */}
          <Route path="/users" element={
            <ProtectedRoute allowRoles={['super_admin']}>
              <MainLayout>
                <ManageUsers />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Upload/Editor Route */}
          <Route path="/upload" element={
            <ProtectedRoute allowRoles={['operator', 'super_admin']}>
              <MainLayout>
                <FormArsip />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;