import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import {PrimeReactProvider} from 'primereact/api';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { PrivateRoute } from './helpers/RouteMiddleware';
import Dashboard from './pages/Dashboard/Dashboard';
import MasterSupplier from './pages/MasterSupplier/MasterSupplier';
import MasterPurchaseOrder from './pages/PurchaseOrder/MasterPurchaseOrder';
import DetailPurchaseOrder from './pages/PurchaseOrder/DetailPurchaseOrder';
import CreatePurchaseOrder from './pages/PurchaseOrder/CreatePurchaseOrder';
import AddStockPO from './pages/PurchaseOrder/AddStockPO';
import AddStockRO from './pages/ReceivingOrder/AddStockRO';
import DetailReceivingOrder from './pages/ReceivingOrder/DetailReceivingOrder';
import MasterReceivingOrder from './pages/ReceivingOrder/MasterReceivingOrder';
import DetailPO from './pages/ReceivingOrder/DetailPO';
import PreviewListPO from './pages/ReceivingOrder/PreviewListPO';
import CreateReceivingOrder from './pages/ReceivingOrder/CreateReceivingOrder';


function App() {
  return (
    <PrimeReactProvider>
      <Router>
        <Routes>
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/master-supplier'
            element={
              <PrivateRoute>
                <MasterSupplier/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/master-po'
            element={
              <PrivateRoute>
                <MasterPurchaseOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/master-po/detail/:id'
            element={
              <PrivateRoute>
                <DetailPurchaseOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/purchase-order'
            element={
              <PrivateRoute>
                <CreatePurchaseOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/purchase-order/create'
            element={
              <PrivateRoute>
                <AddStockPO/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/master-ro'
            element={
              <PrivateRoute>
                <MasterReceivingOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/master-ro/detail'
            element={
              <PrivateRoute>
                <DetailReceivingOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/receiving-order'
            element={
              <PrivateRoute>
                <PreviewListPO/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/receiving-order/detail-po/:id'
            element={
              <PrivateRoute>
                <DetailPO/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/receiving-order/create-mst'
            element={
              <PrivateRoute>
                <CreateReceivingOrder/>
              </PrivateRoute>
            }  
          />
          <Route
            path='/receiving-order/create'
            element={
              <PrivateRoute>
                <AddStockRO/>
              </PrivateRoute>
            }  
          />
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
}

export default App;
