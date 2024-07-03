import React, { useEffect, useState } from 'react'
import PageLayout from '../../layouts/PageLayout/PageLayout'
import Loading from '../../components/Loading/Loading';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { BASE_API_PROCUREMENT, OnChangeValue } from '../../helpers';
import axios from 'axios';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import TableHeader from '../../components/TableHeader/TableHeaderButton';
import { Button } from 'primereact/button';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';

const MasterSupplier = () => {
  // Dialog Handler 
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [dialogAddUpdate, setDialogAddUpdate] = useState(false);
  const [statusAction, setStatusAction] = useState("CREATE");

  // Data Handler 
  const [listSupplier, setListSupplier] = useState([]);
  const [listBank, setListBank] = useState([])
  const [detailSupplier, setDetailSupplier] = useState({
    fc_suppliercode: "",
    fv_suppliernpwp: "",
    fv_suppliername: "",
    fv_suppliername_alias: "",
    fv_supplieraddress:"",
    fc_picname1: "",
    fv_supplierphone1: "",
    fc_legalstatus: "",
    fc_branchtype:"",
    fc_suppliertaxcode: "",
    fv_npwpname: "",
    fv_npwpaddress: "",
    fn_agingpayable: "",
    fm_accountpayable: "",
    fc_supplierbank: "",
    fc_bankaccount: "",
    ft_description: ""
  });
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });

  // Filter Data 
  const [ filters, setFilters ] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...filters}

    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const getAllSupplier = async () => {
    setLoading(true)

    const optionGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/supplier`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionGet)
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

  const getListBank = async () => {
    const optionGetData = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/general/bank`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionGetData)
      .then((response) => {
        setListBank(response.data)
        setLoading(false)
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Load Data",
          errorMessage: error.response.data.message
        })

        setLoading(false)
      })
  }

  const createSupplier = async () => {
    setLoading(true)
  
    const optionCreate = {
      method: 'post',
      url: `${BASE_API_PROCUREMENT}/supplier`,
      data: detailSupplier,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionCreate)
      .then((response) => {
        if(response.data.status === 201) {
          setRefresh(!refresh);
          setLoading(false);
          resetData();
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Create",
          errorMessage: error.response.data.message
        });

        setLoading(false)
      });
  }

  const updateSupplier = async () => {
    setLoading(true)
    const suppliercode = window.btoa(detailSupplier.fc_suppliercode)

    const optionUpdate = {
      method: 'put',
      url: `${BASE_API_PROCUREMENT}/supplier/${suppliercode}`,
      data: detailSupplier,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionUpdate)
      .then((response) => {
        if(response.data.status === 201) {
          setRefresh(!refresh);
          setLoading(false);
          resetData();
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Update",
          errorMessage: error.response.data.message
        });

        setLoading(false);
      });
  }

  const deleteSupplier = async () => {
    setLoading(true);
    setDialogConfirm(false);
    const suppliercode = window.btoa(detailSupplier.fc_suppliercode);

    const optionDelete = {
      method: 'delete',
      url: `${BASE_API_PROCUREMENT}/supplier/${suppliercode}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionDelete)
      .then(() => {
          setRefresh(!refresh);
          resetData();
          setLoading(false);
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Delete",
          errorMessage: error.response.data.message
        });

        setLoading(false);
      });
  }

  const saveHandler = () => {
    setDialogAddUpdate(false)
    if (statusAction === "CREATE") createSupplier();
    if (statusAction === "UPDATE") updateSupplier();
  }

  useEffect(() => {
    getAllSupplier();
    getListBank();
  }, [refresh]);

  const resetData = () => {
    setDetailSupplier({
      fc_suppliercode: "",
      fv_suppliernpwp: "",
      fv_suppliername: "",
      fv_suppliername_alias: "",
      fv_supplieraddress:"",
      fc_picname1: "",
      fv_supplierphone1: "",
      fc_legalstatus: "",
      fc_branchtype:"",
      fc_suppliertaxcode: "",
      fv_npwpname: "",
      fv_npwpaddress: "",
      fn_agingpayable: "",
      fm_accountpayable: "",
      fc_supplierbank: "",
      fc_bankaccount: "",
      ft_description: ""
    })
  }

  const showDialog = (type, data) => {
    if (data) {
      setDetailSupplier((currentData) => ({
        ...currentData,
        ...data
      }));
    }

    if (type === "CREATE" || type === "UPDATE") {
      if (type === "CREATE") setStatusAction("CREATE");
      else setStatusAction("UPDATE");
      setDialogAddUpdate(true);
    }

    if (type === "DELETE") {
      setDetailSupplier((currentData) => ({
        ...currentData,
        fc_membercode: data.fc_membercode
      }));

      setDialogConfirm(true);
    }
  }

  const hideDialog = (type) => {
    if (type === "CONFIRM") setDialogConfirm(false)
    if (type === "CREATE" || type === "UPDATE") setDialogAddUpdate(false)
    resetData()
  }

  const renderHeader = () => {
    return (
        <TableHeader 
          onGlobalFilterChange={onGlobalFilterChange} 
          labelButton={"Tambah Supplier"} 
          globalFilterValue={globalFilterValue} 
          actionButton={() => showDialog("CREATE")} 
          iconHeader={"fas fa-store-alt iconHeader"}
        />
    );
  };

  const footerDialogAddUpdate = () => {
    return (
      <React.Fragment>
          <Button label="Cancel" icon="pi pi-times" outlined onClick={() => hideDialog("CREATE")} className='mr-3'/>
          <Button label="Save" icon="pi pi-check" onClick={() => saveHandler()}/>
      </React.Fragment>
    )
  }

  const actionBodyTemplate = (data) => (
    <div className="d-flex gap-2">
      <Button className='buttonAction' outlined icon="pi pi-eye" severity='success'/>
      <Button className='buttonAction' icon="pi pi-pencil" severity='primary' onClick={() => showDialog("UPDATE", data)}/>
      <Button className='buttonAction' outlined icon="pi pi-trash" severity='danger' onClick={() => showDialog("DELETE", data)}/>
    </div>
  )


  return (
    <PageLayout>
      <Loading visibility={loading} />

      <ErrorDialog
        visibility={errorAttribut.visibility}
        headerTitle={errorAttribut.headerTitle}
        errorMessage={errorAttribut.errorMessage}
        setAttribute={setErrorAttribut}
      />

      <ConfirmDialog 
        visibility={dialogConfirm} 
        submitAction={() => deleteSupplier()} 
        cancelAction={() => hideDialog("CONFIRM")} 
        confirmMessage={"Yakin ingin menghapus Supplier ini?"} 
        iconConfirm="pi pi-exclamation-triangle" 
        headerTitle="Hapus Supplier" 
      />

      <Dialog 
        header="Supplier" 
        visible={dialogAddUpdate} 
        style={{ width: '60rem' }} breakpoints={{ '960px': '75vm', '641px': '90vw' }}
        onHide={() => hideDialog("UPDATE")} 
        footer={footerDialogAddUpdate}
      >
        <div className='flex flex-wrap gap-2'>
          <div className='flex-auto mb-3'>
            <label htmlFor="fc_legalstatus" className='font-bold block mb-2'>Legalitas</label>
            <Dropdown 
              id='fc_legalstatus' 
              options={['PT', 'CV', 'BUMN']} 
              name='fc_legalstatus' 
              value={detailSupplier.fc_legalstatus}
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fv_suppliername" className='font-bold block mb-2'>Nama Supplier</label>
            <InputText 
              id='fv_suppliername' 
              name='fv_suppliername' 
              value={detailSupplier.fv_suppliername} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex-auto mb-3'>
            <label htmlFor="fv_suppliername_alias" className='font-bold block mb-2'>Nama Alias</label>
            <InputText 
              id='fv_suppliername_alias' 
              name='fv_suppliername_alias' 
              value={detailSupplier.fv_suppliername_alias} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fc_branchtype" className='font-bold block mb-2'>Status Kantor</label>
            <Dropdown 
              id='fc_branchtype' 
              options={['BRANCH', 'HEAD OFFICE']} 
              name='fc_branchtype' 
              placeholder='Pilih Status' 
              value={detailSupplier.fc_branchtype} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
        </div>

        <div className='flex-auto mb-3'>
          <label htmlFor="fv_supplieraddress" className='font-bold block mb-2'>Alamat</label>
          <InputTextarea 
            id='fv_supplieraddress' 
            name='fv_supplieraddress' 
            value={detailSupplier.fv_supplieraddress} 
            onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
            rows={3} 
            className='w-full' 
            required 
            autoFocus
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex-auto mb-3'>
            <label htmlFor="fc_picname1" className='font-bold block mb-2'>Nama PIC</label>
            <InputText 
              id='fc_picname1' 
              name='fc_picname1' 
              value={detailSupplier.fc_picname1} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fv_supplierphone1" className='font-bold block mb-2'>Telp PIC</label>
            <InputText 
              id='fv_supplierphone1' 
              name='fv_supplierphone1' 
              value={detailSupplier.fv_supplierphone1} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)}
              className='w-full' 
              required 
              autoFocus
            />
          </div>
        </div>

        <div className='flex-auto mb-3'>
          <label htmlFor="fc_suppliertaxcode" className='font-bold block mb-2'>Pajak</label>
          <Dropdown 
            id='fc_suppliertaxcode' 
            name='fc_suppliertaxcode' 
            options={['PPN', 'NON']} 
            placeholder='Pilih Jenis Pajak' 
            value={detailSupplier.fc_suppliertaxcode} 
            onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
            className='w-full' 
            required 
            autoFocus
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex-auto mb-3'>
            <label htmlFor="fc_supplierbank" className='font-bold block mb-2'>Bank</label>
            <Dropdown 
              id='fc_supplierbank' 
              name='fc_supplierbank' 
              options={listBank} 
              filter 
              optionLabel='fc_information' 
              optionValue='fc_trxcode' 
              placeholder='Pilih Bank' 
              value={detailSupplier.fc_supplierbank} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fc_bankaccount" className='font-bold block mb-2'>No Rekening</label>
            <InputText 
              id='fc_bankaccount' 
              name='fc_bankaccount' 
              value={detailSupplier.fc_bankaccount} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required
              autoFocus
            />
          </div>
        </div>

        <hr style={{border: '1px solid black'}} />

        <div className="flex flex-wrap gap-2">
          <div className='flex-auto mb-3'>
            <label htmlFor="fv_suppliernpwp" className='font-bold block mb-2'>NPWP - No</label>
            <InputText 
              id='fv_suppliernpwp' 
              name='fv_suppliernpwp' 
              value={detailSupplier.fv_suppliernpwp} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fv_npwpname" className='font-bold block mb-2'>NPWP - Nama</label>
            <InputText 
              id='fv_npwpname' 
              name='fv_npwpname' 
              value={detailSupplier.fv_npwpname} 
              onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
        </div>

        <div className='flex-auto mb-3'>
          <label htmlFor="fv_npwpaddress" className='font-bold block mb-2'>NPWP - Alamat</label>
          <InputText 
            id='fv_npwpaddress' 
            name='fv_npwpaddress' 
            value={detailSupplier.fv_npwpaddress} 
            onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
            className='w-full' 
            required 
            autoFocus
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className='flex-auto mb-3'>
            <label htmlFor="fm_accountpayable" className='font-bold block mb-2'>Max. Nominal Hutang</label>
            <div className="p-inputgroup flex-1">
              <span className="p-inputgroup-addon">Rp</span>
              <InputNumber 
                id='fm_accountpayable' 
                name='fm_accountpayable' 
                value={detailSupplier.fm_accountpayable} 
                onValueChange={(e) => OnChangeValue(e, setDetailSupplier)} 
                className='w-full'
                min={0}
                maxFractionDigits={2} 
                required 
                autoFocus
              />
            </div>
          </div>
          <div className='flex-auto mb-3'>
            <label htmlFor="fn_agingpayable" className='font-bold block mb-2'>Max. Masa Hutang</label>
            <div className="p-inputgroup flex-1">
              <InputNumber 
                id='fn_agingpayable' 
                name='fn_agingpayable' 
                value={detailSupplier.fn_agingpayable} 
                onValueChange={(e) => OnChangeValue(e, setDetailSupplier)} 
                className='w-full' 
                required 
                autoFocus
              />
              <span className="p-inputgroup-addon">HARI</span>
            </div>
          </div>
        </div>

        <hr style={{border: '1px solid black'}} />

        <div className='flex-auto mb-3'>
          <label htmlFor="ft_description" className='font-bold block mb-2'>Deskripsi</label>
          <InputTextarea 
            id='ft_description' 
            name='ft_description' 
            value={detailSupplier.ft_description} 
            onChange={(e) => OnChangeValue(e, setDetailSupplier)} 
            rows={3} 
            className='w-full' 
            required 
            autoFocus
          />
        </div>
      </Dialog>

      <Card title="Daftar Supplier">
        <DataTable
          value={listSupplier} dataKey='fc_suppliercode'
          tablestyle={{minwidth:'90rem'}}
          paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
          scrollable removableSort header={renderHeader}
          filters={filters} globalFilterFields={[
            'fV_suppliernpwp',
            'fv_suppliername',
            'fv_suppliername_alias',
            'fv_supplieraddress',
            'fc_picname1',
            'fv_supplierphone1',
            'fc_legalstatus',
            'fc_branchtype',
            'fc_suppliertaxcode',
            'fv_npwpname',
            'fv_npwpaddress',
            'fn_agingpayable',
            'fm_accountpayable',
            'bank.ft_information',
            'fc_bankaccount',
            'ft_description'
          ]}
        >
          <Column field='fv_suppliernpwp' header="NPWP" sortable style={{minWidth: '14rem'}}></Column>
          <Column field='fv_suppliername' header="Nama Supplier" sortable style={{minWidth: '14rem'}}></Column>
          <Column field='fv_suppliername_alias' header="Nama Alias" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fv_supplieraddress' header="Alamat" sortable style={{minWidth: '17rem'}}></Column>
          <Column field='fc_picname1' header="PIC" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fv_supplierphone1' header="Telp PIC" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_legalstatus' header="Legalitas" sortable style={{minWidth: '6rem'}}></Column>
          <Column field='fc_branchtype' header="Status Kantor" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fc_suppliertaxcode' header="Pajak" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fv_npwpname' header="Nama NPWP" sortable style={{minWidth: '14rem'}}></Column>
          <Column field='fv_npwpaddress' header="Alamat NPWP" sortable style={{minWidth: '17rem'}}></Column>
          <Column field='fn_agingpayable' header="Max Hutang (Hari)" sortable style={{minWidth: '12rem'}}></Column>
          <Column field='fm_accountpayable' header="Max Hutang (Rp)" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='bank.fc_information' header="Bank" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_bankaccount' header="No. Rekening" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '9rem'}}></Column>
          <Column body={actionBodyTemplate} ></Column>
        </DataTable>
      </Card>
      
    </PageLayout>
  )
}

export default MasterSupplier
