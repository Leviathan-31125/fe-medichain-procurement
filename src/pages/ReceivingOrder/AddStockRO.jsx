import React, { useEffect, useState } from 'react';
import './style.css';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { BASE_API_PROCUREMENT, OnChangeValue, formatDateToDB, formattedDateWithOutTime, getSeverity } from '../../helpers';
import axios from 'axios';
import Loading from '../../components/Loading/Loading';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import TableHeader from '../../components/TableHeader/TableHeader';
import { Dialog } from 'primereact/dialog';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import SuccessDialog from '../../components/Dialog/SuccessDialog';
import { Card } from 'primereact/card';

const AddStockRO = () => {
  const navigate = useNavigate();

  // Dialog Handler 
  const [loading, setLoading] = useState(false);
  const [dialogAddStock, setDialogAddStock] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    visibility: false,
    cancelAction: () => (""),
    submitAction: () => (""),
    confirmMessage: "",
    iconConfirm: "pi pi-exclamation-triangle",
    headerTitle: ""
  });
  const [successDialog, setSuccessDialog] = useState({
    visibility: false,
    headerTitle: "",
    nextAction: () => (""),
    successMessage: ""
  });
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });

  // Data Handler 
  const [dataRO, setDataRO] = useState({
    fc_pono: "",
    fc_rono: "",
    fc_sjno: "",
    fd_roarrivaldate: "",
    fc_warehousecode: "",
    fv_receiver: "",
    fv_arrivaladdress: "",
    warehouse: {
      fv_warehousename: ""
    },
    pomst: {
      podtl: []
    },
    temprodtl: [],
    ft_description: ""
  });
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
  const [detailRODTL, setDetailRODTL] = useState({
    'fc_barcode': "",
    'fc_stockcode': "",
    'fc_statusbonus': "",
    'fv_namestock': "",
    'fm_price': "",
    'fm_discprice': "",
    'fn_qty': 0,
    'fc_batch': "",
    'fd_expired': "",
    'ft_description': "",
    'maxQTY': 0
  });
  const [addOnTempROMST, setAddOnTempROMST] = useState({
    fv_receiver: "",
    fv_arrivaladdress: "",
    romst_ft_description: ""
  });

  // filter primereact 
  const [ filters, setFilters ] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }) 
  const [ ROfilters, setROFilters ] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [ROFilterValue, setROFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...filters}

    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }
  const onROFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...ROfilters}

    _filters['global'].value = value
    setROFilters(_filters)
    setROFilterValue(value)
  }

  const getDetailRO = async () => {
    setLoading(true);
    const rono = window.btoa(localStorage.getItem('userId'));

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst/${rono}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setDataRO(response.data.data);
        setSupplier(response.data.data.pomst.supplier);
        setAddOnTempROMST((currentData) => ({
          fv_arrivaladdress: response.data.data.pomst.fv_destination,
        }));

        setLoading(false);
      })
      .catch((error) => {
        navigate('/receiving-order');
      });
  }

  const addRODTL = async () => {
    hideDialog("ADDRODTL");
    setLoading(true);
    const rono = window.btoa(localStorage.getItem('userId'));

    const optionsPOST = {
      method: 'post',
      url: `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-dtl/${rono}`,
      data: {
        ...detailRODTL,
        fd_expired: formatDateToDB(detailRODTL.fd_expired)
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsPOST)
      .then(() => {
        getDetailRO();
        resetData();
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Add Data",
          errorMessage: error.response.data.message
        });
        setLoading(false)
      });
  }

  const removeRODTL = async (data) => {
    setLoading(true);
    const rono = window.btoa(localStorage.getItem('userId'));

    const optionsGet = {
      method: 'delete',
      url: `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-dtl/${rono}`,
      data: {fn_rownum: data.fn_rownum},
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then(() => {
        getDetailRO();
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Remove Data",
          errorMessage: error.response.data.message
        });
        setLoading(false)
      });
  }

  const cancelROMST = async () => {
    setLoading(true);

    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));

    const rono = localStorage.getItem("userId");
    const fc_rono = window.btoa(rono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst/${fc_rono}/cancel`,
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsUpdate)
      .then((response) => {
        if(response.status === 200){
          setSuccessDialog({
            visibility: true,
            headerTitle: "Sukses",
            successMessage: "Yeay, berhasil membatalkan receiving order",
            nextAction: () => navigate('/receiving-order')
          });
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Cancel Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  const submitROMST = async () => {
    setLoading(true);

    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));

    const rono = localStorage.getItem("userId");
    const fc_rono = window.btoa(rono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst/${fc_rono}/submit`,
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsUpdate)
      .then((response) => {
        if(response.status === 200){
          setSuccessDialog({
            visibility: true,
            headerTitle: "Sukses",
            successMessage: "Yeay, berhasil mensubmit receiving order",
            nextAction: () => navigate('/receiving-order')
          });
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Submit Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  const updateInfoROMST = async () => {
    setLoading(true);

    const rono = localStorage.getItem("userId");
    const fc_rono = window.btoa(rono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst/${fc_rono}`,
      data: {
        fv_receiver: addOnTempROMST.fv_receiver,
        fv_arrivaladdress: addOnTempROMST.fv_arrivaladdress,
        ft_description: addOnTempROMST.romst_ft_description
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsUpdate)
      .then(() => {
        getDetailRO();
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Update Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  useEffect(() => {
    getDetailRO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderHeader = (icon, filter, onChangeFilter) => {
    return (
      <TableHeader
        globalFilterValue={filter}
        onGlobalFilterChange={onChangeFilter}
        iconHeader={icon}
      />
    );
  };

  const statusTemplate = (data) => {
    return getSeverity("STATUS_BONUS", data)
  }

  const actionBodyTemplate = (data) => {
    if(data.fn_qty === data.fn_qty_ro) 
      return <Button 
        icon="pi pi-check" 
        severity='success' 
        className='buttonAction'
        style={{paddingBlock: '5px'}}
        disabled   
      />
    else
      return <Button 
        label='Pilih' 
        severity='warning' 
        className='buttonAction' 
        style={{paddingBlock: '5px'}}
        onClick={() => showDialog("ADDRODTL", data)}
      />
  }

  const actionBodyTemplateRODTL = (data) => (
    <Button 
      icon="pi pi-trash" 
      severity='danger' 
      outlined
      className='buttonAction'
      style={{paddingBlock: '5px'}} 
      onClick={() => removeRODTL(data)}  
    />
  )

  const resetData = () => {
    setDetailRODTL({
      'fc_barcode': "",
      'fc_stockcode': "",
      'fc_statusbonus': "",
      'fv_namestock': "",
      'fm_price': "",
      'fm_discprice': "",
      'fn_qty': 0,
      'fc_batch': "",
      'fd_expired': "",
      'ft_description': "",
      'maxQTY': 0
    });
  }

  const hideDialog = (type) => {
    if (type === "ADDRODTL") setDialogAddStock(false);
    resetData();
  }

  const showDialog = (type, data) => {
    if (type === "ADDRODTL") {
      setDetailRODTL((currentData) => ({
        ...currentData,
        fc_barcode: data.fc_barcode,
        fc_stockcode: data.fc_stockcode,
        fv_namestock: data.stock.fv_namestock,
        fm_price: data.fm_price,
        fm_discprice: data.fm_discprice,
        fc_statusbonus: data.fc_statusbonus,
        maxQTY: data.fn_qty - data.fn_qty_ro
      }));
      setDialogAddStock(true);
    }
  }

  const footerDialogAddRODTL = () => {
    return (
      <React.Fragment>
          <Button label="Cancel" icon="pi pi-times" outlined onClick={() => hideDialog("ADDRODTL")} className='mr-3'/>
          <Button label="Add" icon="pi pi-check" onClick={() => addRODTL()}/>
      </React.Fragment>
    )
  }

  const actionConfirmHandler = (type) => {
    if (type === "SUBMIT") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => submitROMST(),
        confirmMessage: "Yakin ingin mensubmit Receiving Order?",
        headerTitle: "Submit"
      }))
    }

    if (type === "CANCEL") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => cancelROMST(),
        confirmMessage: "Yakin ingin membatalkan Receiving Order?",
        headerTitle: "Cancel RO"
      }))
    }
  }

  const changeHandler = (event) => {
    OnChangeValue(event, setAddOnTempROMST);
  }

  return (
    <PageLayout>
      <Loading visibility={loading}/>

      <ConfirmDialog
        visibility={confirmDialog.visibility}
        cancelAction={confirmDialog.cancelAction}
        submitAction={confirmDialog.submitAction}
        confirmMessage={confirmDialog.confirmMessage}
        iconConfirm={confirmDialog.iconConfirm}
        headerTitle={confirmDialog.headerTitle}
      />

      <ErrorDialog 
        visibility={errorAttribut.visibility} 
        headerTitle={errorAttribut.headerTitle} 
        errorMessage={errorAttribut.errorMessage}
        setAttribute={setErrorAttribut}
      />

      <SuccessDialog
        visibility={successDialog.visibility}
        headerTitle={successDialog.headerTitle}
        nextAction={() => successDialog.nextAction}
        successMessage={successDialog.successMessage}
      />

      <Dialog
        header="Detail Stok Diterima" 
        visible={dialogAddStock} 
        style={{ width: '60rem' }} breakpoints={{ '960px': '75vm', '641px': '90vw' }}
        onHide={() => hideDialog("ADDRODTL")} 
        footer={footerDialogAddRODTL}
      >
        <div className="row">
          <div className='col-lg-4 col-12 mb-2'>
            <label htmlFor="fc_stockcode" className='font-bold block mb-2'>Katalog</label>
            <InputText 
              id='fc_stockcode'
              name='fc_stockcode' 
              value={detailRODTL.fc_stockcode}
              onChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full'
              required 
              autoFocus
              disabled
            />
          </div>
          <div className='col-lg-8 col-12 mb-2'>
            <label htmlFor="fv_namestock" className='font-bold block mb-2'>Nama Stok</label>
            <InputText 
              id='fv_namestock'
              name='fv_namestock' 
              value={detailRODTL.fv_namestock}
              onChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full' 
              required 
              autoFocus
              disabled
            />
          </div>
        </div>
        
        <div className="row">
          <div className='col-lg-2 col-12 mb-2'>
            <label htmlFor="fn_qty" className='font-bold block mb-2'>QTY</label>
            <InputNumber 
              id='fn_qty'
              name='fn_qty' 
              value={detailRODTL.fn_qty}
              onValueChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full' 
              required 
              autoFocus
              min={1}
              max={detailRODTL.maxQTY}
            />
          </div>
          <div className='col-lg-5 col-12 mb-2'>
            <label htmlFor="fc_batch" className='font-bold block mb-2'>Batch</label>
            <InputText 
              id='fc_batch'
              name='fc_batch' 
              value={detailRODTL.fc_batch}
              onChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full' 
              required 
              autoFocus
            />
          </div>
          <div className='col-lg-5 col-12 mb-2'>
            <label htmlFor="fd_expired" className='font-bold block mb-2'>Expired</label>
            <Calendar 
              id='fd_expired'
              name='fd_expired' 
              value={detailRODTL.fd_expired}
              onChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full' 
              dateFormat='dd-mm-yy'
              required 
              showIcon
            />
          </div>
        </div>

        <div className="row">
          <div className='col-12 mb-2'>
            <label htmlFor="ft_description" className='font-bold block mb-2'>Catatan</label>
            <InputTextarea 
              id='ft_description'
              name='ft_description' 
              value={detailRODTL.ft_description}
              onChange={(e) => OnChangeValue(e, setDetailRODTL)} 
              className='w-full' 
              required 
            />
          </div>
        </div>
      </Dialog>

      <div className="flex gap-3">
        <Panel 
          header="Info RO" 
          className='cardPO'
          toggleable
          collapsed
        >
          <div className="row">
            <div className='col-lg-6 col-12 mb-2'>
              <label htmlFor="fc_pono" className='font-bold block mb-1'>No. PO</label>
              <InputText 
                id='fc_pono'
                name='fc_pono'
                value={dataRO.fc_pono} 
                className='w-full' 
                disabled
              /> 
            </div>
            <div className='col-lg-6 col-12 mb-2'>
              <label htmlFor="fc_rono" className='font-bold block mb-1'>Operator</label>
              <InputText 
                id='fc_rono'
                name='fc_rono'
                value={dataRO.fc_rono} 
                className='w-full' 
                disabled
              /> 
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fc_sjno" className='font-bold block mb-1'>Surat Jalan</label>
              <InputText 
                id='fc_sjno'
                name='fc_sjno'
                value={dataRO.fc_sjno} 
                className='w-full' 
                disabled
              />
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_roarrivaldate" className='font-bold block mb-1'>Tanggal Penerimaan</label>
              <Calendar 
                id='fd_roarrivaldate'
                name='fd_roarrivaldate'
                value={new Date(dataRO.fd_roarrivaldate)} 
                className='w-full' 
                dateFormat='dd-mm-yy' 
                showIcon
                disabled
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-8 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_sodate_user" className='font-bold block mb-1'>Gudang Penerimaan</label>
              <InputText 
                value={dataRO.warehouse.fv_warehousename} 
                className='w-full'
                disabled
              />
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-2 d-flex align-items-end'>
              <Button 
                label='Cancel RO'
                severity="danger"
                className='w-full buttonAction'
                onClick={() => actionConfirmHandler("CANCEL")}
              />
            </div>
          </div>
        </Panel>
        <Panel 
          header="Detail Supplier" 
          className='cardSupplier'
          toggleable
          collapsed
        >
          <div className='row'>
            <div className='col-lg-4 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fv_suppliernpwp" className='font-bold block mb-1'>NPWP</label>
              <InputText value={supplier.fv_suppliernpwp} className='w-full' disabled/>
            </div>
            <div className='col-lg-2 col-sm-3 col-3 mb-2'>
              <label htmlFor="supplier.fc_legalstatus" className='font-bold block mb-1'>Legalitas</label>
              <InputText value={supplier.fc_legalstatus} className='w-full' disabled/>
            </div>
            <div className='col-lg-6 col-sm-9 col-9 mb-2'>
              <label htmlFor="supplier.fv_suppliername" className='font-bold block mb-1'>Nama Supplier</label>
              <InputText value={supplier.fv_suppliername} className='w-full' disabled/>
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fc_branchtype" className='font-bold block mb-1'>Status Kantor</label>
              <InputText value={supplier.fc_branchtype} className='w-full' disabled/>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fc_picname1" className='font-bold block mb-1'>PIC</label>
              <InputText value={supplier.fc_picname1} className='w-full' disabled/>
            </div>
            <div className='col-lg-5 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fn_agingpayable" className='font-bold block mb-1'>Batas Masa Hutang</label>
              <InputNumber value={supplier.fn_agingpayable} className='w-full' disabled/>
            </div>
          </div>
          <div className="row">
            <div className='col-lg-7 col-sm-9 col-9 mb-lg-0 mb-2'>
              <label htmlFor="supplier.fv_npwpaddress" className='font-bold block mb-1'>Alamat Customer</label>
              <InputTextarea value={supplier.fv_npwpaddress} className='w-full' rows={1}/>
            </div>
            <div className='col-lg-5 col-sm-3 col-3 mb-lg-0 mb-2'>
              <label htmlFor="supplier.fm_accountpayable" className='font-bold block mb-1'>Batas Hutang</label>
              <InputNumber value={supplier.fm_accountpayable} className='w-full' disabled/>
            </div>
          </div>
        </Panel>
      </div>

      <Panel header="List Order (PO)" className='mt-3' toggleable>
        <DataTable 
          value={dataRO.pomst.podtl} dataKey='fc_barcode'
          tablestyle={{minwidth:'50rem'}} 
          paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          removableSort scrollable 
          header={() => renderHeader("fas fa-boxes iconHeader", globalFilterValue, onGlobalFilterChange)}
          filters={filters} 
          globalFilterFields={[
            'fc_stockcode', 
            'stock.fv_namestock', 
            'fc_namepack',
            'stock.fv_namealias_stock', 
            'brand.fv_brandname', 
            'fm_purchase',
            'fn_qty',
            'fn_qty_ro',
            'ft_description'
          ]}
        >
          <Column field='fn_rownum' header="No" sortable style={{minWidth: '1rem'}}></Column>
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='stock.fv_namestock' header="Nama Stok" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fn_qty' header="Pesanan" sortable style={{minWidth: '4rem'}}></Column>
          <Column field='fn_qty_ro' header="Terkirim" sortable style={{minWidth: '4rem'}}></Column>
          <Column field='fc_statusbonus' header="Bonus" body={(data) => statusTemplate(data.fc_statusbonus, "STOCK")} style={{minWidth: '6rem'}}></Column>
          <Column field='ft_description' header="Deskripsi" style={{minWidth: '10rem'}}></Column>
          <Column body={actionBodyTemplate} frozen alignFrozen='right'/>
        </DataTable>
      </Panel>

      <Panel header="Penerimaan" className='mt-3' toggleable>
        <DataTable 
          value={dataRO.temprodtl} dataKey='fn_rownum'
          tablestyle={{minwidth:'50rem'}} 
          paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          removableSort scrollable 
          header={() => renderHeader("fas fa-shopping-basket iconHeader", ROFilterValue, onROFilterChange)}
          filters={ROfilters} 
          globalFilterFields={[
            'fc_stockcode',
            'fc_barcode',
            'stock.fv_namestock',
            'fc_namepack',
            'fc_namepack',
            'fc_batch',
            'fd_expired',
            'fn_qty',
            'ft_description'
          ]}
        >
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='stock.fv_namestock' header="Nama Stok" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='fn_qty' header="Qty" sortable style={{minWidth: '3rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '6rem'}}></Column>
          <Column field='fc_batch' header="Batch" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fc_batch' header="Batch" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fd_expired' header="Expired" body={(data) => formattedDateWithOutTime(data.fd_expired)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_statusbonus' header="Bonus" body={(data) => statusTemplate(data.fc_statusbonus, "STOCK")} style={{minWidth: '8rem'}}></Column>
          <Column field='ft_description' header="Deskripsi" style={{minWidth: '12rem'}}></Column>
          <Column body={actionBodyTemplateRODTL} frozen alignFrozen='right'/>
        </DataTable>
      </Panel>

      <Card className='mt-3'>
        <div className="row mb-2">
          <div className="col-lg-3 col-6 py-0 pt-1">
            <label htmlFor="fv_receiver" className='font-bold block mb-1'>Penerima</label>
            <InputText 
              id='fv_receiver'
              name='fv_receiver'
              value={addOnTempROMST.fv_receiver}
              className='w-full'
              onChange={changeHandler}
            />
          </div>
          <div className="col-lg-3 col-6 py-0 pt-1">
            <label htmlFor="fv_arrivaladdress" className='font-bold block mb-1'>Alamat Diterima</label>
            <InputText 
              id='fv_arrivaladdress'
              name='fv_arrivaladdress'
              value={addOnTempROMST.fv_arrivaladdress}
              className='w-full'
              onChange={changeHandler}
            />
          </div>
          <div className="col-lg-6 col-12 py-0 pt-1">
            <label htmlFor="pomst_ft_description" className='font-bold block mb-1'>Catatan</label>
            <InputTextarea 
              id='romst_ft_description'
              name='romst_ft_description'
              value={addOnTempROMST.romst_ft_description}
              className='w-full'
              rows={1}
              onChange={changeHandler}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button 
            label='Update' 
            severity='info' 
            className='buttonAction'
            onClick={() => updateInfoROMST()}
          />
        </div>
      </Card>

      <div className="d-flex justify-content-end">
        <Button 
          label='Submit' 
          severity='success'
          className='buttonAction mt-3'
          visible={dataRO.temprodtl.length > 0 && dataRO.fv_receiver !== "" ? true : false}
          onClick={() => actionConfirmHandler("SUBMIT")} 
        />
      </div>
    </PageLayout>
  )
}

export default AddStockRO
