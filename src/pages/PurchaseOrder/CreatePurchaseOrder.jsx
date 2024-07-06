import React, { useEffect, useState } from 'react';
import './style.css';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import Loading from '../../components/Loading/Loading';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { FilterMatchMode } from 'primereact/api';
import { BASE_API_PROCUREMENT, OnChangeValue, formatDateToDB, formattedDateWithOutTime } from '../../helpers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TableHeader from '../../components/TableHeader/TableHeader';
import { Button } from 'primereact/button';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();

  // dialog handler 
  const [loading, setLoading] = useState(false);
  const [dialogListSupplier, setDialogListSupplier] = useState(false);
  const [dialogCreatePO, setDialogCreatePO] = useState(false);

  // data handler 
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });
  const [dataCreatePO, setDataCreatePO] = useState({
    fc_pono: localStorage.getItem('userId'),
    fc_suppliercode: "",
    fd_podate_user: new Date()
  });

  // filter primereact 
  const [ filters, setFilters ] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }) 
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...filters}

    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  // list data response 
  const [listSupplier, setListSupplier] = useState([]);
  const [supplier, setSupplier] = useState({
    fc_suppliertaxcode: "",
    fv_suppliernpwp: "",
    fc_legalstatus: "",
    fv_suppliername: "",
    fc_branchtype: "",
    fn_agingpayable: "",
    fv_npwpaddress: "",
    fm_accountpayable: "",
    fc_picname1: ""
  });

  const getDetailPO = async () => {
    setLoading(true);
    const pono = window.btoa(localStorage.getItem('userId'));

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/purchase-order/temp-po-mst/${pono}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then(() => {
        navigate('/purchase-order/create')
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const getListSupplier = async () => {
    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/supplier`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setListSupplier(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Load Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  const createTempPOMST = async () => {
    setLoading(true)
    setDialogCreatePO(false)

    const optionsCreate = {
      method: 'post',
      url: `${BASE_API_PROCUREMENT}/purchase-order/temp-po-mst`,
      data: {
        ...dataCreatePO,
        fd_podate_user: formatDateToDB(dataCreatePO.fd_podate_user)
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsCreate)
      .then((response) => {
        if (response.data.status === 201)
          navigate('/purchase-order/create');
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Create Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  useEffect(() => {
    getDetailPO();
    getListSupplier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeHandler = (event) => {
    OnChangeValue(event, setDataCreatePO);
  }

  const chooseSupplier = (data) => {
    setDataCreatePO((currentData) => ({
      ...currentData,
      fc_suppliercode: data.fc_suppliercode
    }));

    setSupplier(data);
    setDialogListSupplier(false);
  }

  const showDialogListSupplier = () => {
    setDialogListSupplier(true);
  }

  const renderHeader = () => {
    return (
        <TableHeader 
          onGlobalFilterChange={onGlobalFilterChange}
          globalFilterValue={globalFilterValue} 
          iconHeader={"fas fa-users iconHeader"}
        />
    );
  };

  const actionBodyTemplate = (data) => (
    <Button severity='success' label='Pilih' style={{borderRadius: "10px"}} onClick={()  => chooseSupplier(data)}></Button>
  )

  return (
    <PageLayout>
      <Loading visibility={loading}/>
      <ErrorDialog 
        visibility={errorAttribut.visibility} 
        headerTitle={errorAttribut.headerTitle} 
        errorMessage={errorAttribut.errorMessage}
        setAttribute={setErrorAttribut}
      />

      <ConfirmDialog 
        visibility={dialogCreatePO} 
        cancelAction={() => setDialogCreatePO(false)} 
        submitAction={createTempPOMST}
        confirmMessage="Yakin ingin membuat Purchase Order ?"
        headerTitle="Buat PO"
      />

      <Dialog 
        visible={dialogListSupplier} 
        style={{ width: '80rem' }} 
        breakpoints={{ '960px': '80vw', '641px': '90vw' }} 
        header="Daftar Customer"
        onHide={() => setDialogListSupplier(false)}
      >
        <DataTable 
          value={listSupplier}
          tablestyle={{minwidth:'60rem'}}
          paginator scrollable removableSort
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          dataKey='fc_suppliercode'
          header={renderHeader}  
          filters={filters}
          globalFilterFields={[
            'fv_suppliername', 
            'fv_supplieralias_name', 
            'fv_supplieraddress', 
            'fv_suppliernpwp', 
            'fc_legalstatus', 
            'fc_branchtype'
          ]}
        >
          <Column field='fc_legalstatus' header="Legalitas" sortable style={{minWidth: '3rem'}}></Column>
          <Column field='fv_suppliername' header="Nama Supplier" sortable style={{minWidth: '13rem'}}></Column>
          <Column field='fv_suppliername_alias' header="Nama Alias Supplier" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fv_supplieraddress' header="Alamat" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='fv_suppliernpwp' header="NPWP" sortable style={{minWidth: '13rem'}}></Column>
          <Column field='fc_branchtype' header="Status Kantor" sortable style={{minWidth: '8rem'}}></Column>
          <Column body={actionBodyTemplate} style={{minWidth: '7rem'}}></Column>
        </DataTable>
      </Dialog>

      <div className="flex gap-3">
        <Panel 
          header="Info PO" 
          className='cardPO'
          toggleable
        >
          <p>Tgl System : <span>{formattedDateWithOutTime(new Date())}</span></p>
          <div className="row">
            <div className='col-lg-6 col-sm-12 col-12 mb-1'>
              <label htmlFor="fc_pono" className='font-bold block mb-1'>Operator</label>
              <InputText value={dataCreatePO.fc_pono} className='w-full' disabled></InputText>
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-1'>
              <label htmlFor="fc_sono" className='font-bold block mb-1'>Tanggal PO</label>
              <Calendar value={dataCreatePO.fd_podate_user} dateFormat='dd-mm-yy' className='w-full'></Calendar>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8 col-sm-12 col-12 mb-1'>
              <label htmlFor="fc_suppliercode" className='font-bold block mb-1'>Supplier</label>
              <div className="p-inputgroup flex-1">
                  <InputText 
                    id='fc_membercode'
                    name='fc_membercode'
                    value={dataCreatePO.fc_suppliercode} 
                    onChange={changeHandler} 
                    placeholder="Pilih Supplier" 
                    disabled
                  />
                  <Button icon="pi pi-search" className="p-button-primary" onClick={() => showDialogListSupplier()} />
              </div>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-1'>
              <label htmlFor="customer.fc_membertaxcode" className='font-bold block mb-1'>Pajak</label>
              <InputText value={supplier.fc_suppliertaxcode} className='w-full' disabled/>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <Button 
              label='Buat PO' 
              severity='success' 
              className='buttonAction'
              onClick={() => setDialogCreatePO(true)}
            />
          </div>
        </Panel>
        <Panel 
          header="Detail Supplier" 
          className='cardSupplier'
          toggleable
        >
          <div className='row'>
            <div className='col-lg-4 col-sm-12 col-12 mb-1'>
              <label htmlFor="supplier.fv_suppliernpwp" className='font-bold block mb-1'>NPWP</label>
              <InputText value={supplier.fv_suppliernpwp} className='w-full' disabled/>
            </div>
            <div className='col-lg-2 col-sm-3 col-3 mb-1'>
              <label htmlFor="supplier.fc_legalstatus" className='font-bold block mb-1'>Legalitas</label>
              <InputText value={supplier.fc_legalstatus} className='w-full' disabled/>
            </div>
            <div className='col-lg-6 col-sm-9 col-9 mb-1'>
              <label htmlFor="customer.fv_membername" className='font-bold block mb-1'>Nama Supplier</label>
              <InputText value={supplier.fv_suppliername} className='w-full' disabled/>
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-12 mb-1'>
              <label htmlFor="customer.fc_branchtype" className='font-bold block mb-1'>Status Kantor</label>
              <InputText value={supplier.fc_branchtype} className='w-full' disabled/>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-1'>
              <label htmlFor="customer.fc_typebusiness" className='font-bold block mb-1'>PIC</label>
              <InputText value={supplier.fc_picname1} className='w-full' disabled/>
            </div>
            <div className='col-lg-5 col-sm-12 col-12 mb-1'>
              <label htmlFor="customer.fn_agingreceivable" className='font-bold block mb-1'>Masa Hutang</label>
              <InputNumber value={supplier.fn_agingpayable} className='w-full' disabled/>
            </div>
          </div>
          <div className="row">
            <div className='col-lg-7 col-sm-9 col-9 mb-lg-0 mb-1'>
              <label htmlFor="customer.fc_memberaddress" className='font-bold block mb-1'>Alamat Supplier</label>
              <InputTextarea value={supplier.fv_npwpaddress} className='w-full' rows={1}/>
            </div>
            <div className='col-lg-5 col-sm-3 col-3 mb-lg-0 mb-1'>
              <label htmlFor="customer.fm_accountreceivable" className='font-bold block mb-1'>Hutang</label>
              <InputNumber value={supplier.fm_accountpayable} className='w-full' disabled/>
            </div>
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default CreatePurchaseOrder
