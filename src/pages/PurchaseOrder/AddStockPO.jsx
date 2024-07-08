import React, { useEffect, useState } from 'react';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import { Panel } from 'primereact/panel';
import { BASE_API_PROCUREMENT, OnChangeValue, addDays, formatDateToDB, formatIDRCurrency, formattedDateWithOutTime, getSeverity } from '../../helpers';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import Loading from '../../components/Loading/Loading';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { FilterMatchMode } from 'primereact/api';
import { SelectButton } from 'primereact/selectbutton';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import TableHeader from '../../components/TableHeader/TableHeader';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import './style.css';
import { useNavigate } from 'react-router-dom';
import SuccessDialog from '../../components/Dialog/SuccessDialog';

const AddStockPO = () => {
  const navigate = useNavigate();

  // Data Static 
  const statusBonus = [
    {
      value: "F",
      label: "REGULER"
    },
    {
      value: "T",
      label: "BONUS"
    },
  ];
  
  // Dialog Handler 
  const [loading, setLoading] = useState(false);
  const [dialogListStock, setDialogListStock] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    visibility: false,
    cancelAction: () => (""),
    submitAction: () => (""),
    confirmMessage: "",
    iconConfirm: "pi pi-exclamation-triangle",
    headerTitle: ""
  });
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });
  const [successDialog, setSuccessDialog] = useState({
    visibility: false,
    headerTitle: "",
    nextAction: () => (""),
    successMessage: ""
  });


  // Data Handler 
  const [detailPO, setDetailPO] = useState({
    fc_pono: localStorage.getItem("userId"),
    fc_suppliercode: "",
    fc_suppliertaxcode: "",
    fn_podetail: 0,
    fm_disctotal: 0,
    fm_taxvalue: 0,
    fm_brutto: 0,
    fm_netto: 0,
    fm_downpayment: 0,
    fd_podate_user:  null,
    fd_poexpired: null,
    fc_potransport: "",
    fv_destination: "",
    pomst_ft_description: ""
  });
  const [addOnTempPOMST, setAddOnTempPOMST] = useState({
    fm_downpayment: 0,
    fd_poexpired: null,
    fd_podate_user: null,
    fc_potransport: "",
    fv_destination: "",
    pomst_ft_description: ""
  });
  const [supplier, setSupplier] = useState({
    fc_suppliertaxcode: "",
    fv_suppliernpwp: "",
    fc_legalstatus: "",
    fv_suppliername: "",
    fc_branchtype: "",
    fc_picname1: "",
    fn_agingpayable: 0,
    fv_npwpaddress: "",
    fm_accountpayable: 0
  });
  const [listStock, setListStock] = useState([]);
  const [listWarehouse, setListWarehouse] = useState([]);
  const [listPODTL, setListPODTL] = useState([]);
  const [expired, setExpired] = useState(30);
  const [dataAddPODTL, setDataAddPODTL] = useState({
    fc_barcode: "",
    fc_stockcode: "",
    fc_statusbonus: "F",
    fn_qty: 0,
    fm_price: 0,
    fm_discprice: 0,
    ft_description: ""
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
      .then((response) => {
        response.data.data.fd_poexpired = addDays(response.data.data.fd_podate_user, 30);
        response.data.data.pomst_ft_description = response.data.data.ft_description;
        
        setDetailPO(response.data.data);
        setSupplier(response.data.data.supplier);
        setListPODTL(response.data.data.temppodtl);
        setAddOnTempPOMST({
          fm_downpayment: response.data.data.fm_downpayment,
          fd_podate_user: response.data.data.fd_podate_user,
          fd_poexpired:  response.data.data.fd_poexpired,
          fc_potransport: response.data.data.fc_potransport,
          fv_destination: response.data.data.fv_destination,
          pomst_ft_description: response.data.data.pomst_ft_description
        });
        setLoading(false);
      })
      .catch((error) => {
        navigate('/purchase-order');
      })
  }

  const getListStock = async () => {
    // setLoading(true);

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/purchase-order/temp-po-dtl/stock/all`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setListStock(response.data);
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

  const getListWarehouse = async () => {
    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/general/warehouse`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setListWarehouse(response.data);
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

  const addStock = async () => {
    setLoading(true);
    setConfirmDialog(false);

    const pono = localStorage.getItem("userId");
    const fc_pono = window.btoa(pono);

    const optionsCreate = {
      method: 'post',
      url:  `${BASE_API_PROCUREMENT}/purchase-order/temp-po-dtl/${fc_pono}`,
      data: dataAddPODTL,
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsCreate)
      .then((response) => {
        if(response.status === 200){
          resetStockDTL()
          getDetailPO()
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Add Stock",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  const removeStock = async (data) => {
    setLoading(true);

    const pono = localStorage.getItem("userId");
    const fc_pono = window.btoa(pono);

    const optionsRemove = {
      method: 'delete',
      url:  `${BASE_API_PROCUREMENT}/purchase-order/temp-po-dtl/${fc_pono}`,
      data: {
        fn_rownum: data.fn_rownum
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsRemove)
      .then((response) => {
        if(response.status === 200){
          getDetailPO();
        }
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Remove Stock",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  const updateInfoPOMST = async () => {
    setLoading(true);
    const pono = localStorage.getItem("userId");
    const fc_pono = window.btoa(pono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/purchase-order/temp-po-mst/${fc_pono}`,
      data: {
        fd_podate_user: formatDateToDB(addOnTempPOMST.fd_podate_user),
        fd_poexpired: formatDateToDB(addOnTempPOMST.fd_poexpired),
        fm_downpayment: addOnTempPOMST.fm_downpayment,
        ft_description: addOnTempPOMST.pomst_ft_description,
        fv_destination: addOnTempPOMST.fv_destination,
        fc_potransport:addOnTempPOMST.fc_potransport,
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsUpdate)
      .then(() => {
        getDetailPO();
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Update Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      });
  }

  const submitPOMST = async () => {
    setLoading(true);
    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));

    const pono = localStorage.getItem("userId");
    const fc_pono = window.btoa(pono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/purchase-order/temp-po-mst/${fc_pono}/submit`,
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
            successMessage: "Yeay, berhasil mensubmit purchase order",
            nextAction: navigate('/purchase-order')
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

  const cancelPOMST = async () => {
    setLoading(true);

    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));

    const pono = localStorage.getItem("userId");
    const fc_pono = window.btoa(pono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_PROCUREMENT}/purchase-order/temp-po-mst/${fc_pono}/cancel`,
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
            successMessage: "Yeay, berhasil membatalkan purchase order",
            nextAction: navigate('/purchase-order')
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

  useEffect(() => {
    getDetailPO();
    getListStock();
    getListWarehouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const resetStockDTL = () => {
    setDataAddPODTL({
      fc_barcode: "",
      fc_stockcode: "",
      fc_statusbonus: "F",
      fn_qty: "",
      fm_price: 0,
      fm_discprice: 0,
      ft_description: ""
    })
  }

  const chooseStock = (data) => {
    setDataAddPODTL((currentData) => ({
      ...currentData,
      fm_price: data.fm_purchase,
      fc_barcode: data.fc_barcode,
      fc_stockcode: data.fc_stockcode
    }));

    setDialogListStock(false);
  }

  const changeHandler = (event) => {
    OnChangeValue(event, setDataAddPODTL);
  }

  const changeDayExpiredHandler = (event) => {
    const {name, value} = event.target;
    
    if (name === "day_expired") {
      setExpired(value);
      setAddOnTempPOMST((currentData) => ({
        ...currentData,
        fd_poexpired: addDays(addOnTempPOMST.fd_podate_user, value)
      }));
    } else {
      OnChangeValue(event, setDetailPO);
      const day = 1000 * 60 * 60 * 24;
      const podate = name === "fd_podate_user" ? new Date(value) : new Date(addOnTempPOMST.fd_podate_user);
      const poexpired = name === "fd_poexpired" ? new Date(value) : new Date(addOnTempPOMST.fd_poexpired);
      const days = parseInt((poexpired - podate) / day, 10);
      setExpired(days)
    }
  }

  const changeHandlerAddOn = (event) => {
    OnChangeValue(event, setAddOnTempPOMST)
  }

  const renderHeader = (iconHeader, titleHeader) => {
    return (
        <TableHeader 
          onGlobalFilterChange={onGlobalFilterChange}
          globalFilterValue={globalFilterValue} 
          iconHeader={iconHeader}
          titleHeader={titleHeader}
        />
    );
  };

  const actionBodyTemplate = (data) => (
    <Button severity='success' label='Pilih' className='buttonAction' onClick={()  => chooseStock(data)}></Button>
  )

  const actionBodyTemplateStock = (data) => (
    <Button 
      severity='success' 
      icon='pi pi-trash' 
      className='buttonAction' 
      outlined
      onClick={() => removeStock(data)}
    />
  )

  const statusTemplate = (data) => (
    getSeverity("STATUS_BONUS", data)
  )

  const actionConfirmHandler = (type) => {
    if (type === "SUBMIT") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => submitPOMST(),
        confirmMessage: "Yakin ingin mensubmit Purchase Order?",
        headerTitle: "Submit"
      }))
    }

    if (type === "CANCEL") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => cancelPOMST(),
        confirmMessage: "Yakin ingin membatalkan Purchase Order?",
        headerTitle: "Cancel PO"
      }))
    }
  }

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
        visibility={confirmDialog.visibility}
        cancelAction={confirmDialog.cancelAction}
        submitAction={confirmDialog.submitAction}
        confirmMessage={confirmDialog.confirmMessage}
        iconConfirm={confirmDialog.iconConfirm}
        headerTitle={confirmDialog.headerTitle}
      />

      <SuccessDialog
        visibility={successDialog.visibility}
        headerTitle={successDialog.headerTitle}
        nextAction={() => successDialog.nextAction}
        successMessage={successDialog.successMessage}
      />

      <Dialog 
        visible={dialogListStock}
        style={{ width: '80rem' }} 
        breakpoints={{ '960px': '80vw', '641px': '90vw' }} 
        header="Daftar Stock"
        onHide={() => setDialogListStock(false)}
      >
        <DataTable 
          value={listStock}
          tablestyle={{minwidth:'50rem'}}
          paginator scrollable removableSort
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          dataKey='fc_barcode'
          header={renderHeader("fas fa-box iconHeader", "")}  
          filters={filters}
          globalFilterFields={['fc_stockcode', 'fv_namestock', 'fv_namealias_stock', 'brand.fv_brandname', 'fc_namepack', 'fc_typestock', 'fm_sales']}
        >
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fv_namestock' header="Nama Stok" sortable style={{minWidth: '12rem'}}></Column>
          <Column field='fv_namealias_stock' header="Nama Alias" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='brand.fv_brandname' header="Brand" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fc_typestock' header="Tipe" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fm_purchase' header="Perkiraan Harga" sortable body={(data) => formatIDRCurrency(data.fm_purchase)} style={{minWidth: '14rem'}}></Column>
          <Column body={actionBodyTemplate} style={{minWidth: '7rem'}}></Column>
        </DataTable>
      </Dialog>

      <div className="flex gap-3">
        <Panel 
          header="Info PO" 
          className='cardPO'
          toggleable
          collapsed
        >
          <p>Tgl System : <span>{formattedDateWithOutTime(new Date())}</span></p>
          <div className="row">
            <div className='col-lg-6 col-sm-12 col-12 mb-1'>
              <label htmlFor="fc_pono" className='font-bold block mb-1'>Operator</label>
              <InputText value={detailPO.fc_pono} className='w-full' disabled></InputText>
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-1'>
              <label htmlFor="fd_podate_user" className='font-bold block mb-1'>Tanggal PO</label>
              <InputText value={formattedDateWithOutTime(detailPO.fd_podate_user)} className='w-full' disabled></InputText>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8 col-sm-12 col-12 mb-1'>
              <label htmlFor="fc_suppliercode" className='font-bold block mb-1'>Kode Supplier</label>
              <InputText value={detailPO.fc_suppliercode} className='w-full' disable/>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-1'>
              <label htmlFor="customer.fc_membertaxcode" className='font-bold block mb-1'>Pajak</label>
              <InputText value={detailPO.fc_suppliertaxcode} className='w-full' disabled/>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-2">
            <Button 
              label='Cancel PO' 
              severity='danger' 
              className='buttonAction'
              onClick={() => actionConfirmHandler("CANCEL")}
            />
          </div>
        </Panel>
        <Panel 
          header="Detail Supplier" 
          className='cardSupplier'
          toggleable
          collapsed
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

      <div className='row'>
        <div className='col-lg-6 col-12 mt-3 py-0'>
          <Panel header="Tambah Stok">
            <div className='row'>
              <div className='col-lg-6 col-12 py-0 pt-1'>
                <label htmlFor="fc_stockcode" className='font-bold block mb-1'>Kode Barang</label>
                <div className="p-inputgroup flex-1">
                  <InputText 
                    id='fc_stockcode'
                    name='fc_stockcode'
                    value={dataAddPODTL.fc_stockcode} 
                    onChange={changeHandler} 
                    placeholder="Pilih Stock" 
                    disabled
                  />
                  <Button icon="pi pi-search" className="p-button-primary" onClick={() => setDialogListStock(true)} />
                </div>
              </div>
              <div className='col-lg-6 col-12 py-0 pt-1'>
                <label htmlFor="fm_price" className='font-bold block mb-1'>Harga</label>
                <InputNumber 
                  id='fm_price'
                  name='fm_price'
                  value={dataAddPODTL.fm_price} 
                  className='w-full' 
                  mode='currency'
                  currency='IDR'
                  locale='id-ID'
                  min={1}
                  onValueChange={changeHandler}
                />
              </div>
            </div>
            <div className="row">
              <div className='col-lg-5 col-sm-6 col-12 py-0 pt-1'>
                <label htmlFor="fm_discprice" className='font-bold block mb-1'>Diskon</label>
                <InputNumber 
                  id='fm_discprice'
                  name='fm_discprice'
                  value={dataAddPODTL.fm_discprice} 
                  className='w-full' 
                  mode='currency'
                  currency='IDR'
                  locale='id-ID'
                  min={0}
                  onValueChange={changeHandler}
                />
              </div>
              <div className='col-lg-2 col-sm-6 col-12 py-0 pt-1'>
                <label htmlFor="fn_qty" className='font-bold block mb-1'>Qty</label>
                <InputNumber 
                  id='fn_qty'
                  name='fn_qty'
                  value={dataAddPODTL.fn_qty} 
                  className='w-full'
                  min={1}
                  onValueChange={changeHandler}
                />
              </div>
              <div className='col-lg-5 col-12 py-0 pt-1'>
                <label htmlFor="ft_description" className='font-bold block mb-1'>Catatan</label>
                <InputText 
                  id='ft_description'
                  name='ft_description'
                  value={dataAddPODTL.ft_description} 
                  className='w-full' 
                  onChange={changeHandler}
                />
              </div>
            </div>
            <div className="d-flex gap-3 justify-content-end pt-2 mt-1">
              <SelectButton 
                id='fc_statusbonus'
                name='fc_statusbonus'
                value={dataAddPODTL.fc_statusbonus}
                onChange={changeHandler} 
                options={statusBonus} 
                optionLabel='label' 
                optionValue='value'
                className='select-button'
              />
              <Button 
                label='Tambahkan Pesanan' 
                severity='success' 
                className='buttonAction'
                style={{paddingBlock: '5px'}}
                onClick={() => addStock()}
              />
            </div>
          </Panel>
        </div>  
        <div className='col-lg-6 col-12 mt-3 py-0'>
          <Panel header="Perkiraan Tagihan">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Item</h5>
                  <p className='calculate-number'>{detailPO.fn_sodetail}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Diskon</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailPO.fm_disctotal)}</p>
                </div>
              </div>
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Total</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailPO.fm_brutto)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Pajak</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailPO.fm_taxvalue)}</p>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-5 mb-3">
              <h5 className='title-calculate'>Down Payment</h5>
              <div className="p-inputgroup flex-1">
                <InputNumber
                  id='fm_downpayment'
                  name='fm_downpayment'
                  value={addOnTempPOMST.fm_downpayment}  
                  mode='currency'
                  currency='IDR'
                  locale='id-ID' 
                  onValueChange={changeHandlerAddOn}
                />
                <Button icon="pi pi-pencil" className="p-button-primary" onClick={() => updateInfoPOMST()} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h5 className='title-calculate grand-total'>GRAND TOTAL</h5>
              <p className='grand-total'>{formatIDRCurrency(detailPO.fm_netto - detailPO.fm_downpayment)}</p>
            </div>
          </Panel>
        </div>
      </div>

      <Card className='mt-3'>
        <DataTable 
          value={listPODTL}
          tablestyle={{minwidth:'50rem'}}
          paginator scrollable removableSort
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          dataKey='fn_rownum'
          header={renderHeader("", "List Order")}  
          filters={filters}
          globalFilterFields={[
            'fc_stockcode', 
            'stock.fv_namestock',  
            'brand.fv_brandname', 
            'fc_namepack', 
            'fc_typestock',
            'fn_qty',
            'fc_namepack',
            'fm_price',
            'fm_discprice',
            'fm_value',
            'ft_description'
          ]}
        >
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='stock.fv_namestock' header="Nama Stock" sortable style={{minWidth: '12rem'}}></Column>
          <Column field='fc_statusbonus' header="Status" body={(data) => statusTemplate(data.fc_statusbonus)} sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fn_qty' header="Qty" sortable style={{minWidth: '4rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '7rem'}}></Column>
          <Column field='fm_price' header="Harga" sortable body={(data) => formatIDRCurrency(data.fm_price)} style={{minWidth: '8rem'}}></Column>
          <Column field='fm_discprice' header="Diskon" sortable body={(data) => formatIDRCurrency(data.fm_discprice)} style={{minWidth: '8rem'}}></Column>
          <Column field='fm_value' header="Total" sortable body={(data) => formatIDRCurrency(data.fm_value)} style={{minWidth: '8rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '5rem'}}></Column>
          <Column body={actionBodyTemplateStock} style={{minWidth: '3rem'}}></Column>
        </DataTable>
      </Card>

      <Card className='mt-3'>
        <div className="row mb-2">
          <div className='col-lg-6 col-12 py-0 pt-1'>
            <label htmlFor="fd_sodate_user" className='font-bold block mb-1'>Tanggal PO</label>
            <Calendar 
              id='fd_podate_user'
              name='fd_podate_user'
              value={new Date(addOnTempPOMST.fd_podate_user)}
              showIcon
              className='w-full'
              onChange={changeDayExpiredHandler}
              dateFormat='dd-mm-yy'
            />
          </div>
          <div className='col-lg-6 col-12 py-0 pt-1'>
            <label htmlFor="fd_soexpired" className='font-bold block mb-1'>Tanggal Expired</label>
            <div className='d-flex gap-2'>
              <div className="p-inputgroup flex-1">
                <InputNumber 
                  id='day_expired'
                  name='day_expired'
                  value={expired} 
                  onValueChange={changeDayExpiredHandler}
                />
                <span className="p-inputgroup-addon">Hari</span>
              </div>
              <Calendar 
                id='fd_poexpired'
                name='fd_poexpired'
                value={detailPO.fd_poexpired}
                showIcon
                className='w-75'
                onChange={changeDayExpiredHandler}
                dateFormat='dd-mm-yy'
              />
            </div>
          </div>
        </div>
        
        <div className="row mb-2">
          <div className="col-lg-3 col-12 py-0 pt-1">
            <label htmlFor="fc_potransport" className='font-bold block mb-1'>Transportasi</label>
            <Dropdown 
                id='fc_potransport'
                name='fc_potransport'
                value={addOnTempPOMST.fc_potransport}
                options={['By MediChain', 'By Supplier', 'Pihak Ke-tiga (Jasa)']}
                placeholder='Pilih Transport'
                className='w-full'
                onChange={changeHandlerAddOn}
              />
          </div>
          <div className='col-lg-9 col-12 py-0 pt-1'>
            <label htmlFor="fd_podate_user" className='font-bold block mb-1'>Destinasi PO</label>
            <div className='d-flex gap-2'>
              <Dropdown 
                id='fv_destination'
                name='fv_destination'
                options={listWarehouse}
                optionLabel='fv_warehousename'
                optionValue='fv_warehouseaddress'
                value={addOnTempPOMST.fv_destination}
                filter
                placeholder='Pilih Destinasi'
                className='dropdown-destination'
                onChange={changeHandlerAddOn}
              />
              <InputText value={addOnTempPOMST.fv_destination} className='input-destination' disabled/>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="pomst_ft_description" className='font-bold block mb-1'>Catatan</label>
          <InputTextarea 
            id='pomst_ft_description'
            name='pomst_ft_description'
            value={addOnTempPOMST.pomst_ft_description}
            className='w-full'
            onChange={changeHandlerAddOn}
          />
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button 
            label='Update' 
            severity='info' 
            className='buttonAction'
            onClick={() => updateInfoPOMST()}
          />
        </div>
      </Card>

      <div className="d-flex justify-content-end">
        <Button 
          label='Submit' 
          severity='success' 
          className='buttonAction mt-3' 
          visible={detailPO.fc_potransport === "" || detailPO.fn_podetail <= 0 ? false : true}
          onClick={() => actionConfirmHandler("SUBMIT")}
        />
      </div>
    </PageLayout>
  )
}

export default AddStockPO
