import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { formatIDRCurrency, formattedDateWithOutTime, getSeverity } from '../../helpers';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import { FilterMatchMode } from 'primereact/api';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import TableHeader from '../../components/TableHeader/TableHeader';
import { DataTable } from 'primereact/datatable';
import { Panel } from 'primereact/panel';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import './style.css';

const DetailPurchaseOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dataPO = location.state;
  const supplier = dataPO.supplier;
  
  // Dialog Handler
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
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

  const statusTemplate = (data) => (
    getSeverity("STATUS_BONUS", data)
  )

  const renderHeader = () => {
    return (
      <TableHeader
        globalFilterValue={globalFilterValue}
        onGlobalFilterChange={onGlobalFilterChange}
        iconHeader="fas fa-boxes iconHeader"
      />
    );
  };

  return (
    <PageLayout>
      <ErrorDialog visibility={errorAttribut.visibility} errorMessage={errorAttribut.errorMessage} headerTitle={errorAttribut.headerTitle} setAttribute={setErrorAttribut}/>

      <div className="flex gap-3">
        <Panel 
          header="Info SO" 
          className='cardPO'
          toggleable
        >
          <div className='row'>
            <div className='col-12 mb-2'>
              <label htmlFor="fc_pono" className='font-bold block mb-1'>No. PO</label>
              <InputText value={dataPO.fc_pono} className='w-full' disabled/> 
            </div>
          </div>
          <div className="row">
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_poexpired" className='font-bold block mb-1'>Tanggal PO</label>
              <InputText value={formattedDateWithOutTime(dataPO.fd_podate_user)} className='w-full' disabled/>
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_poexpired" className='font-bold block mb-1'>Expired PO</label>
              <InputText value={formattedDateWithOutTime(dataPO.fd_poexpired)} className='w-full' disabled/>
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-8 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_sodate_user" className='font-bold block mb-1'>Pajak - Kode Supplier</label>
              <InputText value={`${dataPO.fc_suppliertaxcode} - ${dataPO.fc_suppliercode}`} className='w-full'/>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-2'>
              <label htmlFor="fc_status" className='font-bold block mb-1'>Status PO</label>
              <Tag 
                value={dataPO.fc_status} 
                severity={getSeverity('STATUS', dataPO.fc_status)}
                className='w-full' style={{paddingBlock: '12px', fontSize: "15px"}}
              />
            </div>
          </div>
        </Panel>
        <Panel 
          header="Detail Supplier" 
          className='cardSupplier'
          toggleable
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

      <Card className='mt-3'>
        <DataTable value={dataPO.podtl} tablestyle={{minwidth:'50rem'}} paginator rows={5} removableSort
          rowsPerPageOptions={[5, 10, 25, 50]} dataKey='fc_barcode' scrollable header={() => renderHeader("fas fa-boxes iconHeader")} filters={filters} 
          globalFilterFields={['fc_stockcode', 'fv_namestock', 'fv_namealias_stock', 'brand.fv_brandname', 'fc_typestock', 'fc_formstock', 'fc_namepack', 'fn_maxstock', 'fn_minstock', 'fm_purchase', 'fm_sales']}
        >
          <Column field='fn_rownum' header="No" sortable style={{minWidth: '3rem'}}></Column>
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='stock.fv_namestock' header="Nama Stok" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fn_qty' header="Pesanan" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fn_qty_ro' header="Terkirim" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fc_statusbonus' header="Bonus" body={(data) => statusTemplate(data.fc_statusbonus)} style={{minWidth: '8rem'}}></Column>
          <Column field='ft_description' header="Deskripsi" style={{minWidth: '12rem'}}></Column>
        </DataTable>
      </Card>

      <div className='row'>
        <div className='col-lg-6 col-12 mt-3 py-0'>
        <Panel header="Atribut Tambahan">
          <div className="row">
            <div className='col-lg-6 col-12 mb-0'>
              <label htmlFor="fc_potransport" className='font-bold block mb-1'>Transport</label>
              <InputText value={dataPO.fc_potransport} className='w-full' disabled/>
            </div>
            <div className='col-lg-6 col-12 mb-0'>
              <label htmlFor="fv_destination" className='font-bold block mb-1'>Destinasi</label>
              <InputText value={dataPO.fv_destination} className='w-full' disabled/>
            </div>
          </div>
          <div className="row">
            <div className='col-12 mb-0'>
              <label htmlFor="ft_description" className='font-bold block mb-1'>Catatan</label>
              <InputTextarea value={dataPO.ft_description} className='w-full' rows={1} disabled/>
            </div>
          </div>
        </Panel>
        </div>
        <div className='col-lg-6 col-12 mt-3 py-0'>
          <Panel header="Kalkulasi">
            <div className="row">
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Item</h5>
                  <p className='calculate-number'>{dataPO.fn_podetail}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Diskon</h5>
                  <p className='calculate-number'>{formatIDRCurrency(dataPO.fm_disctotal)}</p>
                </div>
              </div>
              <div className="col">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className='title-calculate'>Total</h5>
                  <p className='calculate-number'>{formatIDRCurrency(dataPO.fm_brutto)}</p>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className='title-calculate'>Pajak</h5>
                  <p className='calculate-number'>{formatIDRCurrency(dataPO.fm_taxvalue)}</p>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-5 mb-3">
              <h5 className='title-calculate'>Down Payment</h5>
              <p className='calculate-number'>{formatIDRCurrency(dataPO.fm_downpayment)}</p>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h5 className='title-calculate grand-total'>GRAND TOTAL</h5>
              <p className='grand-total'>{formatIDRCurrency(dataPO.fm_netto - dataPO.fm_downpayment)}</p>
            </div>
          </Panel>
        </div>
      </div>

      <div className='d-flex justify-content-end gap-2 mt-3'>
        <Button className='buttonAction' label='Kembali' severity='info' onClick={() => navigate(-1)}></Button>
      </div>
    </PageLayout>
  )
}

export default DetailPurchaseOrder
