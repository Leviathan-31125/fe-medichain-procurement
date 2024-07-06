import React, { useState, useEffect } from 'react';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import { useNavigate } from 'react-router-dom';
import { FilterMatchMode } from 'primereact/api';
import { BASE_API_SALES, OnChangeValue, addDays, formatDateToDB, formatIDRCurrency, formattedDateWithOutTime } from '../../helpers';
import axios from 'axios';
import Loading from '../../components/Loading/Loading';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import TableHeader from '../../components/TableHeader/TableHeader';
import './style.css';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import SuccessDialog from '../../components/Dialog/SuccessDialog';

const AddStockSO = () => {
  const navigate = useNavigate();
  const [expired, setExpired] = useState(30);
  
  // dialog handler 
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
  const [successDialog, setSuccessDialog] = useState({
    visibility: false,
    headerTitle: "",
    nextAction: () => (""),
    successMessage: ""
  });

  // data handler
  const [detailSO, setDetailSO] = useState({
    fc_salescode: "",
    fc_membercode: "",
    fc_membertaxcode: "",
    fc_sotype: "",
    fn_sodetail: 0,
    fm_disctotal: 0,
    fm_taxvalue: 0,
    fm_brutto: 0,
    fm_netto: 0,
    fm_downpayment: 0,
    fd_sodate_user:  null,
    fd_soexpired: null,
    somst_ft_description: ""
  });
  const [customer, setCustomer] = useState({
    fc_membertaxcode: "",
    fv_membernpwp: "",
    fc_legalstatus: "",
    fv_membername: "",
    fc_branchtype: "",
    fc_typebusiness: "",
    fn_agingreceivable: "",
    fv_npwpaddress: "",
    fm_accountreceivable: ""
  });
  const [dataAddSODTL, setDataAddSODTL] = useState({
    fc_barcode: "",
    fc_stockcode: "",
    fc_statusbonus: "F",
    fn_qty: "",
    fm_price: 0,
    fm_discprice: 0,
    ft_description: ""
  })
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });
  const [listStock, setListStock] = useState([]);
  const [listSODTL, setListSODTL] = useState([]);
  const statusBonus = [
    {
      value: "F",
      label: "REGULER"
    },
    {
      value: "T",
      label: "BONUS"
    },
  ]

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

  const getDetailSO = async () => {
    setLoading(true);
    const sono = window.btoa(localStorage.getItem('userId'));

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_SALES}/temp-so-mst/${sono}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        response.data.data.fd_soexpired = addDays(response.data.data.fd_sodate_user, 30);
        response.data.data.somst_ft_description = response.data.data.ft_description;

        setDetailSO(response.data.data);
        setCustomer(response.data.data.customer);
        setListSODTL(response.data.data.tempsodtl)
        setLoading(false);
      })
      .catch(() => {
        navigate('/sales-order')
      })
  }

  const getListStock = async () => {
    // setLoading(true);

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_SALES}/temp-so-dtl/stock/all`,
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

  const addStock = async () => {
    setLoading(true);
    setConfirmDialog(false);

    const sono = localStorage.getItem("userId");
    const fc_sono = window.btoa(sono);

    const optionsCreate = {
      method: 'post',
      url:  `${BASE_API_SALES}/temp-so-dtl/${fc_sono}`,
      data: dataAddSODTL,
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsCreate)
      .then((response) => {
        if(response.status === 200){
          resetStockDTL()
          getDetailSO()
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

    const sono = localStorage.getItem("userId");
    const fc_sono = window.btoa(sono);

    const optionsRemove = {
      method: 'delete',
      url:  `${BASE_API_SALES}/temp-so-dtl/${fc_sono}`,
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
          getDetailSO()
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

  const updateInfoSOMST = async () => {
    setLoading(true);
    const sono = localStorage.getItem("userId");
    const fc_sono = window.btoa(sono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_SALES}/temp-so-mst/${fc_sono}`,
      data: {
        fd_sodate_user: formatDateToDB(detailSO.fd_sodate_user),
        fd_soexpired: formatDateToDB(detailSO.fd_soexpired),
        fm_downpayment: detailSO.fm_downpayment,
        ft_description: detailSO.somst_ft_description
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsUpdate)
      .then((response) => {
        if(response.status === 200){
          getDetailSO()
        }
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

  const submitSOMST = async () => {
    setLoading(true);
    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));
    const sono = localStorage.getItem("userId");
    const fc_sono = window.btoa(sono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_SALES}/temp-so-mst/${fc_sono}/submit`,
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
            successMessage: "Yeay, berhasil mensubmit sales order",
            nextAction: navigate('/sales-order')
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

  const cancelSOMST = async () => {
    setLoading(true);
    setConfirmDialog((...currentData) => ({
      ...currentData, 
      visibility: false
    }));
    const sono = localStorage.getItem("userId");
    const fc_sono = window.btoa(sono);

    const optionsUpdate = {
      method: 'put',
      url:  `${BASE_API_SALES}/temp-so-mst/${fc_sono}/cancel`,
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
            successMessage: "Yeay, berhasil membatalkan sales order",
            nextAction: navigate('/sales-order')
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
    getDetailSO();
    getListStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actionConfirmHandler = (type) => {
    if (type === "SUBMIT") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => submitSOMST(),
        confirmMessage: "Yakin ingin mensubmit Sales Order?",
        headerTitle: "Submit"
      }))
    }

    if (type === "CANCEL") {
      setConfirmDialog((currentData) => ({
        ...currentData,
        visibility: true,
        cancelAction: () => setConfirmDialog((...currentData) => ({...currentData, visibility: false})),
        submitAction: () => cancelSOMST(),
        confirmMessage: "Yakin ingin membatalkan Sales Order?",
        headerTitle: "Cancel SO"
      }))
    }
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

  const changeHandler = (event) => {
    OnChangeValue(event, setDataAddSODTL);
  }

  const changeHandlerMST = (event) => {
    OnChangeValue(event, setDetailSO);
  }

  const changeDayExpiredHandler = (event) => {
    const {name, value} = event.target;
    
    if (name === "day_expired") {
      setExpired(value);
      setDetailSO((currentData) => ({
        ...currentData,
        fd_soexpired: addDays(detailSO.fd_sodate_user, value)
      }));
    } else {
      OnChangeValue(event, setDetailSO);
      const day = 1000 * 60 * 60 * 24;
      const sodate = name === "fd_sodate_user" ? new Date(value) : new Date(detailSO.fd_sodate_user);
      const soexpired = name === "fd_soexpired" ? new Date(value) : new Date(detailSO.fd_soexpired);
      const days = parseInt((soexpired - sodate) / day, 10);
      setExpired(days)
      console.log((days));
    }
  }

  const resetStockDTL = () => {
    setDataAddSODTL({
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
    setDataAddSODTL((currentData) => ({
      ...currentData,
      fm_price: data.fm_sales,
      fc_barcode: data.fc_barcode,
      fc_stockcode: data.fc_stockcode
    }));

    setDialogListStock(false);
  }

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

  return (
    <PageLayout>
      <Loading visibility={loading}/>
      <ErrorDialog 
        visibility={errorAttribut.visibility} 
        headerTitle={errorAttribut.headerTitle} 
        errorMessage={errorAttribut.errorMessage}
        setAttribute={setErrorAttribut}
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
          <Column field='fm_sales' header="Harga" sortable style={{minWidth: '10rem'}}></Column>
          <Column body={actionBodyTemplate} style={{minWidth: '7rem'}}></Column>
        </DataTable>
      </Dialog>
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
      
      <div className="row">
        <Panel 
          header="Info SO"
          className='col-lg-5 col-sm-12 col-12 py-0' 
          toggleable
          collapsed
        >
          <p>
            Tanggal : 
            <span>{formattedDateWithOutTime(new Date())}</span>
          </p>
          <div className="row">
            <div className='col-lg-6 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="fc_salescode" 
                className='font-bold block mb-1'
              >
                Sales
              </label>
              <InputText  
                value={detailSO.fc_salescode}  
                className='w-full' 
                disabled
              />
            </div>
            <div className='col-lg-6 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="fc_sotype" 
                className='font-bold block mb-1'
              >
                Tipe SO
              </label>
              <InputText 
                value={detailSO.fc_sotype} 
                className='w-full' 
                disabled
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-7 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="fc_membercode" 
                className='font-bold block mb-1'
              >
                Customer
              </label>
              <InputText 
                value={detailSO.fc_membercode} 
                className='w-full' 
                disabled
              />
            </div>
            <div className='col-lg-5 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_membertaxcode" 
                className='font-bold block mb-1'
              >
                Pajak
              </label>
              <InputText 
                value={detailSO.fc_membertaxcode}
                className='w-full' 
                disabled
              />
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <Button 
              label='Batalkan SO' 
              severity='danger' 
              className='buttonAction'
              onClick={() => actionConfirmHandler("CANCEL")}
            />
          </div>
        </Panel>
        <Panel 
          header="Detail Customer"
          className='col-lg-7 col-sm-12 col-12 py-0' 
          toggleable
          collapsed
        >
          <div className='row'>
            <div className='col-lg-4 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_npwp" 
                className='font-bold block mb-1'
              >
                NPWP
              </label>
              <InputText 
                value={customer.fv_membernpwp} 
                className='w-full'
              />
            </div>
            <div className='col-lg-2 col-sm-3 col-3 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_legalstatus" 
                className='font-bold block mb-1'
              >
                Legalitas
              </label>
              <InputText 
                value={customer.fc_legalstatus} 
                className='w-full'
              />
            </div>
            <div className='col-lg-6 col-sm-9 col-9 py-0 mb-2'>
              <label 
                htmlFor="customer.fv_membername" 
                className='font-bold block mb-1'
              >
                Nama Customer
              </label>
              <InputText 
                value={customer.fv_membername} 
                className='w-full'
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_branchtype" c
                lassName='font-bold block mb-1'
              >
                Status Kantor
              </label>
              <InputText 
                value={customer.fc_branchtype} 
                className='w-full' 
                disabled
              />
            </div>
            <div className='col-lg-4 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_typebusiness" 
                className='font-bold block mb-1'
              >
                Tipe Customer
              </label>
              <InputText 
                value={customer.fc_typebusiness} 
                className='w-full' 
                disabled
              />
            </div>
            <div className='col-lg-5 col-sm-12 col-12 py-0 mb-2'>
              <label 
                htmlFor="customer.fn_agingreceivable" 
                className='font-bold block mb-1'
              >
                Masa Hutang
              </label>
              <InputNumber 
                value={customer.fn_agingreceivable} 
                className='w-full' 
                disabled
              />
            </div>
          </div>
          <div className="row">
            <div className='col-lg-7 col-sm-9 col-9 mb-lg-0 py-0 mb-2'>
              <label 
                htmlFor="customer.fc_memberaddress" 
                className='font-bold block mb-1'
              >
                Alamat Customer
              </label>
              <InputTextarea 
                value={customer.fv_npwpaddress} 
                className='w-full' 
                rows={1}
              />
            </div>
            <div className='col-lg-5 col-sm-3 col-3 mb-lg-0 py-0 mb-2'>
              <label 
                htmlFor="customer.fm_accountreceivable" 
                className='font-bold block mb-1'
              >
                Hutang
              </label>
              <InputNumber 
                value={customer.fm_accountreceivable} 
                className='w-full' 
                disabled
                mode='currency'
                currency='IDR'
                locale='id-ID'
              />
            </div>
          </div>
        </Panel>
      </div>

      <div className='row'>
        <div className='col-lg-6 col-12 mt-3 py-0'>
          
        </div>
        <div className='col-lg-6 col-12 mt-3 py-0'>
          <Panel header="Kalkulasi">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Item</h5>
                  <p className='calculate-number'>{detailSO.fn_sodetail}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Diskon</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailSO.fm_disctotal)}</p>
                </div>
              </div>
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Total</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailSO.fm_brutto)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Pajak</h5>
                  <p className='calculate-number'>{formatIDRCurrency(detailSO.fm_taxvalue)}</p>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-5 mb-3">
              <h5 className='title-calculate'>Down Payment</h5>
              <div className="p-inputgroup flex-1">
                <InputNumber
                  id='fm_downpayment'
                  name='fm_downpayment'
                  value={detailSO.fm_downpayment}  
                  mode='currency'
                  currency='IDR'
                  locale='id-ID' 
                  onValueChange={changeHandlerMST}
                />
                <Button icon="pi pi-pencil" className="p-button-primary" onClick={() => updateInfoSOMST()} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h5 className='title-calculate grand-total'>GRAND TOTAL</h5>
              <p className='grand-total'>{formatIDRCurrency(detailSO.fm_netto - detailSO.fm_downpayment)}</p>
            </div>
          </Panel>
        </div>
      </div>

      <Card className='mt-3'>
        <DataTable 
          value={listSODTL}
          tablestyle={{minwidth:'50rem'}}
          paginator scrollable removableSort
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          dataKey='fn_rownum'
          header={renderHeader("", "List Order")}  
          filters={filters}
          globalFilterFields={['fc_stockcode', 'fv_namestock', 'fv_namealias_stock', 'brand.fv_brandname', 'fc_namepack', 'fc_typestock', 'fm_sales']}
        >
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fn_qty' header="Qty" sortable style={{minWidth: '4rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '8rem'}}></Column>
          <Column field='fc_statusbonus' header="Status" sortable style={{minWidth: '5rem'}}></Column>
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
            <label htmlFor="fd_sodate_user" className='font-bold block mb-1'>Tanggal SO</label>
            <Calendar 
              id='fd_sodate_user'
              name='fd_sodate_user'
              value={new Date(detailSO.fd_sodate_user)}
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
                id='fd_soexpired'
                name='fd_soexpired'
                value={detailSO.fd_soexpired}
                showIcon
                className='w-75'
                onChange={changeDayExpiredHandler}
                dateFormat='dd-mm-yy'
              />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="somst_ft_description" className='font-bold block mb-1'>Catatan</label>
          <InputTextarea 
            id='somst_ft_description'
            name='somst_ft_description'
            value={detailSO.somst_ft_description}
            className='w-full'
            onChange={changeHandlerMST}
          />
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button 
            label='Update' 
            severity='info' 
            className='buttonAction'
            onClick={() => updateInfoSOMST()}
          />
        </div>
      </Card>

      <div className="d-flex justify-content-end">
        <Button 
          label='Submit' 
          severity='success' 
          className='buttonAction mt-3' 
          onClick={() => actionConfirmHandler("SUBMIT")}
        />
      </div>
    </PageLayout>
  )
}

export default AddStockSO
