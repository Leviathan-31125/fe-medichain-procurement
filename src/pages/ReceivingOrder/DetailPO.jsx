import React, { useEffect, useState } from 'react';
import PageLayout from '../../layouts/PageLayout/PageLayout';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_API_PROCUREMENT, formatIDRCurrency, formattedDateWithOutTime, getSeverity } from '../../helpers';
import { Tag } from 'primereact/tag';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import TableHeader from '../../components/TableHeader/TableHeader';
import TableHeaderButton from '../../components/TableHeader/TableHeaderButton';
import { FilterMatchMode } from 'primereact/api'
import axios from 'axios'
import Loading from '../../components/Loading/Loading'

const DetailPO = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {id} = params

  // Data Handler 
  const [dataPO, setDataPO] = useState({
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
  const [listRO, setListRO] = useState([]);

  // Dialog Handler 
  const [loading, setLoading] = useState(false);

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

  const getDetailPO = async () => {
    setLoading(true);

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/purchase-order/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setDataPO(response.data);
        setSupplier(response.data.supplier);
        setListRO(response.data.romst);

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      })
  }
  
  useEffect(() => {
    getDetailPO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const statusTemplate = (data, typeStatus) => {
    if (typeStatus === "STOCK") return getSeverity("STATUS_BONUS", data)
    else 
      return (
        <Tag value={data} severity={getSeverity("STATUS", data)}/>
      )
  }

  const renderHeader = (icon, filter, onChangeFilter) => {
    return (
      <TableHeader
        globalFilterValue={filter}
        onGlobalFilterChange={onChangeFilter}
        iconHeader={icon}
      />
    );
  };

  const renderHeaderButton = (icon, filter, onChangeFilter) => {
    return (
      <TableHeaderButton
        globalFilterValue={filter}
        onGlobalFilterChange={onChangeFilter}
        iconHeader={icon}
        actionButton={() => navigate('/receiving-order/create-mst', {state: {dataPO, supplier}})}
        labelButton="Tambah RO +"
      />
    );
  }

  const actionBodyTemplate = (data) => (
    <div className="d-flex gap-2">
      <Button className='buttonAction' outlined icon="pi pi-eye" severity='success' onClick={() => navigate('/master-ro/detail', {state: data})}/>
    </div>
  )

  return (
    <PageLayout>
      <Loading visibility={loading} />

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

      <Panel header="List Order" className='mt-3' toggleable>
        <DataTable 
          value={dataPO.podtl} dataKey='fc_barcode'
          tablestyle={{minwidth:'50rem'}} 
          paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          removableSort scrollable 
          header={() => renderHeader("fas fa-boxes iconHeader", globalFilterValue, onGlobalFilterChange)}
          filters={filters} 
          globalFilterFields={[
            'fc_stockcode', 
            'stock.fv_namestock', 
            'fv_namealias_stock', 
            'brand.fv_brandname', 
            'fc_typestock', 
            'fc_formstock', 
            'fc_namepack', 
            'fn_maxstock', 
            'fn_minstock', 
            'fm_purchase', 
            'fm_sales'
          ]}
        >
          <Column field='fn_rownum' header="No" sortable style={{minWidth: '3rem'}}></Column>
          <Column field='fc_stockcode' header="Katalog" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='stock.fv_namestock' header="Nama Stok" sortable style={{minWidth: '15rem'}}></Column>
          <Column field='fc_namepack' header="Satuan" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fn_qty' header="Pesanan" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fn_qty_ro' header="Terkirim" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fc_statusbonus' header="Bonus" body={(data) => statusTemplate(data.fc_statusbonus, "STOCK")} style={{minWidth: '8rem'}}></Column>
          <Column field='ft_description' header="Deskripsi" style={{minWidth: '12rem'}}></Column>
        </DataTable>
      </Panel>

      <div className='row'>
        <div className='col-lg-6 col-12 mt-3 py-0'>
          <Panel header="Atribut Tambahan" toggleable collapsed>
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
          <Panel header="Kalkulasi" toggleable collapsed>
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

      <Panel header="Daftar Receiving Order" className='mt-3' toggleable>
        <DataTable 
          value={listRO} dataKey='fc_rono'
          tablestyle={{minwidth:'50rem'}} 
          paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} 
          removableSort scrollable 
          header={() => renderHeaderButton("fas fa-clipboard-list iconHeader", ROFilterValue, onROFilterChange)} 
          filters={ROfilters} globalFilterFields={[
            'fc_rono',
            'fc_sjno',
            'fc_pono',
            'fd_roarrivaldate',
            'fc_status',
            'fn_rodetail',
            'ft_description'
          ]} 
        >
          <Column field='fc_rono' header="No. RO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_sjno' header="Surat Jalan" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_pono' header="No. PO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_roarrivaldate' header="Tgl Diterima" body={(data) => formattedDateWithOutTime(data.fd_roarrivaldate)} sortable style={{minWidth: '12rem'}}></Column>
          <Column field='fc_status' header="Status" sortable body={(data) => statusTemplate(data.fc_status, "DOC")} style={{minWidth: '7rem'}}></Column>
          <Column field='fn_rodetail' header="Item" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '12rem'}}></Column>
          <Column body={actionBodyTemplate} ></Column>
        </DataTable>
      </Panel>

      <div className='d-flex justify-content-end gap-2 mt-3'>
        <Button className='buttonAction' label='Kembali' severity='info' onClick={() => navigate(-1)}></Button>
      </div>
    </PageLayout>
  )
}

export default DetailPO