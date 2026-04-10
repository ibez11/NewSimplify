import HeaderIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ClientIcon from '@material-ui/icons/PeopleOutlined';
import TableIcon from '@material-ui/icons/BorderAllOutlined';
import TCIcon from '@material-ui/icons/ListAltOutlined';
import SignIcon from '@material-ui/icons/BorderColorOutlined';
import logo from 'images/simplify_logoC.png';
import qr from 'images/sample-qr.png';

export const invoiceSectionOption = [
  {
    id: 0,
    section: 'headerOptionId',
    title: 'Header',
    description: 'Adjust your company logo, name, and your company details.',
    icon: HeaderIcon,
    options: [
      {
        id: 1,
        description: 'This is the default header layout.',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">INVOICE</h1>
              </p>
            </td>
          </tr>
        </table>`
      },
      {
        id: 2,
        description: 'This header layout includes your entity details and invoice number.',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style="width: 70%">
              <div>
                <p><h3 style="margin:0">Simplify Pte Ltd</h3>
                UEN No.: 1234567890 | GST Reg. No.: 201533140K <br />
                Woodlands Industrial Park E5 Harvest@Woodlands, #05-41, 757322 <br />
                Phone: +65 1234567 | Email: goodairsg@gmail.com
                </p>
              </div>
            </td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">INVOICE</h1>
                <bold>No. 12345678</bold>
              </p>
            </td>
          </tr>
        </table>`
      },
      {
        id: 3,
        description: 'This header layout includes invoice number',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">INVOICE 12345678</h1></p>
            </td>
          </tr>
        </table>`
      }
    ]
  },
  {
    id: 1,
    section: 'clientInfoOptionId',
    title: 'Client Information',
    description: 'Adjust where the client’s information appear.',
    icon: ClientIcon,
    options: [
      {
        id: 1,
        description: 'This is the default client information layout included with your invoice.',
        value: `
        <table>
          <tr>
            <td style="width: 75%; padding-right:10px;vertical-align: top;">
              <h3>Simplify Pte Ltd</h3>
              <p>
              Woodlands Industrial Park E5 Harvest@Woodlands, #06-41, 757322 <br/>
              Phone : +651234567 <br/>
              Email : gcoolengrg@gmail.com <br/>
              UEN No : 1234567890 <br/>
              GST Reg. No : 201533140K <br/>
              </p>
            </td>
            <td style="vertical-align: top;">
              <p>
                <b>Invoice No:</b> 12345678<br />
                <b>Invoice Date:</b> 02 Apr 2025<br />
                <b>Invoice Terms:</b> Due on receipt<br />
                <b>Sales Perosn:</b> -<br />
                <b>Attention To:</b> Yip Ah Poh<br />
                <b>(Custom Field 1):</b> Value<br />
                <b>(Custom Field 2):</b> Value
              </p>
            </td>
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        <table>
          <tr>
             <td style="padding-right: 10px; vertical-align: top;">
              <p>
              <b>Bill To:</b> <br />
              <b>Trevor M. Carlisle</b> <br/>
              Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
             <td style="padding-right: 10px; vertical-align: top;">
              <p>
              <b>Service Address:</b> <br />
              Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
          </tr>
          <tr>
            <td colspan=2>
            <p>
              <b>Quotation Reference:</b> <br />
              Contact: | [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ?| #CT000-00 : 4.0 x [0FCU+0CU]; Collect Payment : $_ ;COD/Payment bill to Tenant/Owner/Agent.
              </p>
            </td>
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        `
      },
      {
        id: 2,
        description: 'This option includes only the client’s details, without your company information or “Billed By” details.',
        value: `
       <table style="width:100%">
        <tr>
            <td>Attention To</td>
            <td>Invoice No</td>
            <td>Invoice Date</td>
            <td>Invoice Terms</td>
            <td>Sales Person</td>
            <td>(Custom Field 1)</td>
            <td>(Custom Field 2)</td>
        </tr>
        <tr>
            <td><b>Yip Ah Poh</b></td>
            <td><b>Yip Ah Poh</b></td>
            <td><b>02 Apr 2024</b></td>
            <td><b>Due on receipt</b></td>
            <td><b>-</b></td>
            <td><b>Value</b></td>
            <td><b>Value</b></td>
        </tr>
      </table>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      <table style="width:100%">
        <tr>
            <td>Bill To</td>
            <td>Service Address</td>
        </tr>
        <tr>
            <td>
                <b>Trevor M. Carlisle</b><br />
                Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </td>
            <td>
              Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
            </td>
        </tr>
      </table>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      <div style="width:100%">
        <p>
        Quotation Reference <br/>
          <b>
            Contact: [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ? | #CT000-00 : 4.0 x [0FCU+0CU];
            Collect Payment : $___;
            COD/Payment bill to Tenant/Owner/Agent.
          </b>
        </p>
      </div>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      `
      },
      {
        id: 3,
        description: 'This option includes the client’s details and  “Billed By” details.',
        value: `
        <table style="width:100%">
          <tr>
            <td style="width:35%; vertical-align: top">
              <p>
                <b>Billed By:</b><br />
                Simplify Pte Ltd <br />
                UEN No : 1234567890 | GST Reg. No : 201533140K <br />
                280 Woodlands Industrial Park E5 Harvest@Woodlands, #06-41, 757322 <br />
                Phone : +651234567 | Email : gcoolengrg@gmail.com 
              </p>
            </td>  
             <td style="width:30%; vertical-align: top">
              <p>
                <b>Bill To:</b><br />
                Trevor M. Carlisle <br />
                Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
              <p>
                <b>Service Address:</b><br />
                Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
            <td style="width:30%; vertical-align: top">
              <p>
                <b>Attention To:</b> Yip Ah Poh<br />
                <b>Invoice Date:</b> 02 Apr 2025<br />
                <b>Invoice Terms:</b> Due on receipt<br />
                <b>Sales Perosn:</b> -<br />
                <b>(Custom Field 1):</b> Value<br />
                <b>(Custom Field 2):</b> Value
              </p>
            </td>  
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        <div style="width:100%">
        <p>
        <b>Quotation Reference</b> <br/>
          Contact: [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ? | #CT000-00 : 4.0 x [0FCU+0CU];
          Collect Payment : $___;
          COD/Payment bill to Tenant/Owner/Agent.
        </p>
      </div>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
       `
      }
    ]
  },
  {
    id: 2,
    section: 'tableOptionId',
    title: 'Table Information',
    description: 'Adjust Service date on the table.',
    icon: TableIcon,
    options: [
      {
        id: 1,
        description: 'The exact date will be displayed.',
        value: `
         <table style="width:100%; border-spacing: 0; border-collapse: collapse;">
          <thead style="background-color: #333333; color: #ffffff">
            <th>Service Date</th>
            <th style="text-align: left;">Service Item</th>
            <th>Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e1e1e1;">
              <td style="text-align: center; vertical-align: top;">
                <p>02 Apr 2025</p>
              </td>
              <td style="width:60%; vertical-align: top;">
                <p>
                  Service item name.
                </p>
                <p style="word-wrap: break-word; white-space: pre-line; margin: 0; margin-bottom: 8px; color: #555555;">
                  Description of the service item.
                </p>
              </td>
              <td style="vertical-align: top; text-align:center">
                <p>1</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
            </tr>
            <tr>
              <td colspan=4 style="vertical-align: top; text-align:right">
                <p>Subtotal</p>
                <p>Total</p>
                <p>GST 9%</p>
                <p>Total Paid</p>
                <p style="font-weight: bolder;font-size: 20px;">Amount Due</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
                <p>$150.00</p>
                <p>$13.50</p>
                <p>$0.00</p>
                <p style="font-weight: bolder;font-size: 20px;">$163.50</p>
              </td>
            </tr>
          </tbody>
        </table>
        `
      },
      {
        id: 2,
        description: 'The date will only display the month and year.',
        value: `
         <table style="width:100%; border-spacing: 0; border-collapse: collapse;">
          <thead style="background-color: #333333; color: #ffffff">
            <th>Service Date</th>
            <th style="text-align: left;">Service Item</th>
            <th>Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e1e1e1;">
              <td style="text-align: center; vertical-align: top;">
                <p>Apr 2025</p>
              </td>
              <td style="width:60%; vertical-align: top;">
                <p>
                  Service item name.
                </p>
                <p style="word-wrap: break-word; white-space: pre-line; margin: 0; margin-bottom: 8px; color: #555555;">
                  Description of the service item.
                </p>
              </td>
              <td style="vertical-align: top; text-align:center">
                <p>1</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
            </tr>
            <tr>
              <td colspan=4 style="vertical-align: top; text-align:right">
                <p>Subtotal</p>
                <p>Total</p>
                <p>GST 9%</p>
                <p>Total Paid</p>
                <p style="font-weight: bolder;font-size: 20px;">Amount Due</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
                <p>$150.00</p>
                <p>$13.50</p>
                <p>$0.00</p>
                <p style="font-weight: bolder;font-size: 20px;">$163.50</p>
              </td>
            </tr>
          </tbody>
        </table>
        `
      }
    ]
  },
  {
    id: 3,
    section: 'tncOptionId',
    title: 'Invoice Footer',
    description: 'Adjust where to display your invoice’s footer position.',
    icon: TCIcon,
    options: [
      {
        id: 1,
        description: 'The default footer position is below the service item table.',
        value: `
        <table>
          <tr>
            <td style="width: 70%">
                <p>
                  <b>Terms & Conditions</b><br/>
                  <ol>
                    <li>Payment Term: 30 Days</li>
                    <li>Price subject to GST</li>
                    <li>Works will be carried out during normal working hours. After office hours, on Sunday or Holiday shall be charged separately.</li>
                    <li>Validity of Quote: 30 Days</li>
                    <li>Works shall be carried out only upon confirmation via Purchase Order or Sign.
                        Please do not hesitate to contact us if you need any further clarification.
                        We hope that the above price quoted is reasonable to you and hope to receive your favorable reply soon.
                    </li>
                  </ol>
                </p>
            </td>
            <td style="width: 15%">
              <p style="text-align: center">
                <b>Qr Payment</b>
                <img src=${qr} alt='qr' style="width: 95%" />
              </p>
            </td>
          </tr>
        </table>
        `
      },
      {
        id: 2,
        description: 'The footer will start on a separate page.',
        value: `
        <table>
          <thead style="background-color: #53a0be; color: #ffffff">
            <th colspan=2>PAGE BREAK</th>
          </thead>
          <tr>
            <td style="width: 70%">
                <p>
                  <b>Terms & Conditions</b><br/>
                  <ol>
                    <li>Payment Term: 30 Days</li>
                    <li>Price subject to GST</li>
                    <li>Works will be carried out during normal working hours. After office hours, on Sunday or Holiday shall be charged separately.</li>
                    <li>Validity of Quote: 30 Days</li>
                    <li>Works shall be carried out only upon confirmation via Purchase Order or Sign.
                        Please do not hesitate to contact us if you need any further clarification.
                        We hope that the above price quoted is reasonable to you and hope to receive your favorable reply soon.
                    </li>
                  </ol>
                </p>
            </td>
            <td style="width: 15%">
              <p style="text-align: center">
                <b>Qr Payment</b>
                <img src=${qr} alt='qr' style="width: 95%" />
              </p>
            </td>
          </tr>
        </table>`
      }
    ]
  }
];

export const quotationSectionOption = [
  {
    id: 0,
    section: 'headerOptionId',
    title: 'Header',
    description: 'Adjust your company logo, name, and your company details.',
    icon: HeaderIcon,
    options: [
      {
        id: 1,
        description: 'This is the default header layout.',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">QUOTATION</h1>
              </p>
            </td>
          </tr>
        </table>`
      },
      {
        id: 2,
        description: 'This header layout includes your entity details and quotation number.',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style="width: 70%">
              <div>
                <p><h3 style="margin:0">Simplify Pte Ltd</h3>
                UEN No.: 1234567890 | GST Reg. No.: 201533140K <br />
                Woodlands Industrial Park E5 Harvest@Woodlands, #05-41, 757322 <br />
                Phone: +651234567 | Email: goodairsg@gmail.com
                </p>
              </div>
            </td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">QUOTATION</h1>
                <bold>No. 12345678</bold>
              </p>
            </td>
          </tr>
        </table>`
      },
      {
        id: 3,
        description: 'This header layout includes quotation number',
        value: `
        <table>
          <tr>
            <td style="width: 15%"><img src=${logo} alt='logo' style="width: 95%" /></td>
            <td style='text-align:right'>
              <p><h1 style="margin-bottom: 10px;">QUOTATION 12345678</h1></p>
            </td>
          </tr>
        </table>`
      }
    ]
  },
  {
    id: 1,
    section: 'clientInfoOptionId',
    title: 'Client Information',
    description: 'Adjust where the client’s information appear.',
    icon: ClientIcon,
    options: [
      {
        id: 1,
        description: 'This is the default client information layout included with your invoice.',
        value: `
        <table>
          <tr>
            <td style="width: 75%; padding-right:10px;vertical-align: top;">
              <h3>Simplify Pte Ltd</h3>
              <p>
              Woodlands Industrial Park E5 Harvest@Woodlands, #06-41, 757322 <br/>
              Phone : +651234567 <br/>
              Email : gcoolengrg@gmail.com <br/>
              UEN No : 1234567890 <br/>
              GST Reg. No : 201533140K <br/>
              </p>
            </td>
            <td style="vertical-align: top;">
              <p>
                <b>Quotation ID:</b> #32145<br />
                <b>Issue Date:</b> 02 Apr 2025<br />
                <b>Expiry Date:</b> 02 Apr 2025<br />
                <b>Term:</b> 02 Apr 2025 - 02 Mei 2025<br />
                <b>Sales Person:</b> -<br />
                <b>Client Name:</b> Trevor M. Carlisle<br />
                <b>(Custom Field 1):</b> Value<br />
                <b>(Custom Field 2):</b> Value
              </p>
            </td>
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        <table>
          <tr>
             <td style="padding-right: 10px; vertical-align: top;">
              <p>
              <b>Billing Address:</b> <br />
              <b>Trevor M. Carlisle</b> <br/>
              Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
             <td style="padding-right: 10px; vertical-align: top;">
              <p>
              <b>Service Address:</b> <br />
              Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
          </tr>
          <tr>
          <td colspan=2>
          <p>
            <b>Quotation Title & Description:</b> <br />
            <b>Service Contract </b> <br />
            Contact: | [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ?| #CT000-00 : 4.0 x [0FCU+0CU]; Collect Payment : $_ ;COD/Payment bill to Tenant/Owner/Agent.
            </p>
          </td>
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        `
      },
      {
        id: 2,
        description: 'This option includes only the client’s details, without your company information or “Billed By” details.',
        value: `
       <table style="width:100%">
        <tr>
            <td style="width:25%">Quotation ID</td>
            <td style="width:25%">Sales Person</td>
            <td style="width:25%">(Custom Field 1)</td>
            <td style="width:25%">(Custom Field 2)</td>
        </tr>
        <tr>
            <td style="width:25%"><b>#32145</b></td>
            <td style="width:25%"><b>-</b></td>
            <td style="width:25%"><b>Value</b></td>
            <td style="width:25%"><b>Value</b></td>
        </tr>
      </table>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
       <table style="width:100%">
        <tr>
            <td style="width:25%">Issue Date</td>
            <td style="width:25%">Expiry Date</td>
            <td style="width:25%">Term</td>
            <td style="width:50%">Client Name</td>
        </tr>
        <tr>
            <td style="width:25%"><b>02 Apr 2025</b></td>
            <td style="width:25%"><b>02 Apr 2025</b></td>
            <td style="width:25%"><b>02 Apr 2025 -  02 Mei 2025</b></td>
            <td style="width:50%"><b>Trevor M. Carlisle</b></td>
        </tr>
      </table>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      <table>
        <tr>
          <td style="padding-right: 10px; vertical-align: top;">
            <p>
            Billing Address: <br />
               <b>Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933</b> 
            </p>
            </td>
          <td style="padding-right: 10px; vertical-align: top;">
            <p>
            Service Address: <br />
               <b>Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933</b>
            </p>
          </td>
        </tr>
      </table>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      <div style="width:100%">
        <p>
        Quotation Title & Description <br/>
          <b>Service Contract</b> <br/>
            Contact: [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ? | #CT000-00 : 4.0 x [0FCU+0CU];
            Collect Payment : $___;
            COD/Payment bill to Tenant/Owner/Agent.
        </p>
      </div>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
      `
      },
      {
        id: 3,
        description: 'This option includes the client’s details and  “Billed By” details.',
        value: `
        <table style="width:100%">
          <tr>
            <td style="width:35%; vertical-align: top">
              <p>
                <b>Billed By:</b><br />
                Simplify Pte Ltd <br />
                UEN No : 1234567890 | GST Reg. No : 201533140K <br />
                280 Woodlands Industrial Park E5 Harvest@Woodlands, #06-41, 757322 <br />
                Phone : +651234567 | Email : gcoolengrg@gmail.com 
              </p>
            </td>  
             <td style="width:30%; vertical-align: top">
              <p>
                <b>Bill To:</b><br />
                Trevor M. Carlisle <br />
                Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
              <p>
                <b>Service Address:</b><br />
                Dbs Ang Mo Kio BranchDbs Ang Mo Kio Branch, 53 Ang Mo Kio Avenue 3, #21-112, 569933
              </p>
            </td>
            <td style="width:30%; vertical-align: top">
              <p>
                <b>Quotation ID:</b> #32145<br />
                <b>Issue Date:</b> 02 Apr 2025<br />
                <b>Expiry Date:</b> 02 Apr 2025<br />
                <b>Term:</b> 02 Apr 2025 - 02 Mei 2025<br />
                <b>Sales Person:</b> -<br />
                <b>Client Name:</b> Trevor M. Carlisle<br />
                <b>(Custom Field 1):</b> Value<br />
                <b>(Custom Field 2):</b> Value
              </p>
            </td>  
          </tr>
        </table>
        <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
        <div style="width:100%">
        <p>
        <b>Quotation Title & Description:</b> <br/>
          <b> Service Contract </b> <br/>
          Contact: [CONTRACT SERVICE] NEED TO BRING CONTRACT AGREEMENT ? | #CT000-00 : 4.0 x [0FCU+0CU];
          Collect Payment : $___;
          COD/Payment bill to Tenant/Owner/Agent.
        </p>
      </div>
      <hr style="height:1px;border-width:0;background-color:#e1e1e1"/>
       `
      }
    ]
  },
  {
    id: 2,
    section: 'tableOptionId',
    title: 'Table Information',
    description: 'Adjust Service date on the table.',
    icon: TableIcon,
    options: [
      {
        id: 1,
        description: 'The exact date will be displayed.',
        value: `
         <table style="width:100%; border-spacing: 0; border-collapse: collapse;">
          <thead style="background-color: #333333; color: #ffffff">
            <th>Service Date</th>
            <th style="text-align: left;">Service Item</th>
            <th>Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e1e1e1;">
              <td style="text-align: center; vertical-align: top;">
                <p>02 Apr 2025</p>
              </td>
              <td style="width:60%; vertical-align: top;">
                <p>
                  Service item name.
                </p>
                <p style="word-wrap: break-word; white-space: pre-line; margin: 0; margin-bottom: 8px; color: #555555;">
                  Description of the service item.
                </p>
              </td>
              <td style="vertical-align: top; text-align:center">
                <p>1</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
            </tr>
            <tr>
              <td colspan=4 style="vertical-align: top; text-align:right">
                <p>Quotation Amount</p>
                <p>Discount</p>
                <p>GST 9%</p>
                <p style="font-weight: bolder;font-size: 20px;">Balance Due</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
                <p>$10.00</p>
                <p>$12.60</p>
                <p style="font-weight: bolder;font-size: 20px;">$152.60</p>
              </td>
            </tr>
          </tbody>
        </table>
        `
      },
      {
        id: 2,
        description: 'The date will only display the month and year.',
        value: `
         <table style="width:100%; border-spacing: 0; border-collapse: collapse;">
          <thead style="background-color: #333333; color: #ffffff">
            <th>Service Date</th>
            <th style="text-align: left;">Service Item</th>
            <th>Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e1e1e1;">
              <td style="text-align: center; vertical-align: top;">
                <p>Apr 2025</p>
              </td>
              <td style="width:60%; vertical-align: top;">
                <p>
                  Service item name.
                </p>
                <p style="word-wrap: break-word; white-space: pre-line; margin: 0; margin-bottom: 8px; color: #555555;">
                  Description of the service item.
                </p>
              </td>
              <td style="vertical-align: top; text-align:center">
                <p>1</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
              </td>
            </tr>
            <tr>
              <td colspan=4 style="vertical-align: top; text-align:right">
                <p>Quotation Amount</p>
                <p>Discount</p>
                <p>GST 9%</p>
                <p style="font-weight: bolder;font-size: 20px;">Balance Due</p>
              </td>
              <td style="vertical-align: top; text-align:right">
                <p>$150.00</p>
                <p>$10.00</p>
                <p>$12.60</p>
                <p style="font-weight: bolder;font-size: 20px;">$152.60</p>
              </td>
            </tr>
          </tbody>
        </table>
        `
      }
    ]
  },
  {
    id: 3,
    section: 'tncOptionId',
    title: 'Terms & Conditions (T&C)',
    description: 'Adjust where to display your invoice’s Term & Condition position.',
    icon: TCIcon,
    options: [
      {
        id: 1,
        description: 'The default T&C position is below the service item table.',
        value: `
        <table>
          <tr>
            <td style="width: 70%">
                <p>
                  <b>Terms & Conditions</b><br/>
                  <ol>
                    <li>Payment Term: 30 Days</li>
                    <li>Price subject to GST</li>
                    <li>Works will be carried out during normal working hours. After office hours, on Sunday or Holiday shall be charged separately.</li>
                    <li>Validity of Quote: 30 Days</li>
                    <li>Works shall be carried out only upon confirmation via Purchase Order or Sign.
                        Please do not hesitate to contact us if you need any further clarification.
                        We hope that the above price quoted is reasonable to you and hope to receive your favorable reply soon.
                    </li>
                  </ol>
                </p>
            </td>
          </tr>
        </table>
        `
      },
      {
        id: 2,
        description: 'The T&C will start on a separate page.',
        value: `
        <table>
          <thead style="background-color: #53a0be; color: #ffffff">
            <th colspan=2>PAGE BREAK</th>
          </thead>
          <tr>
            <td style="width: 70%">
                <p>
                  <b>Terms & Conditions</b><br/>
                  <ol>
                    <li>Payment Term: 30 Days</li>
                    <li>Price subject to GST</li>
                    <li>Works will be carried out during normal working hours. After office hours, on Sunday or Holiday shall be charged separately.</li>
                    <li>Validity of Quote: 30 Days</li>
                    <li>Works shall be carried out only upon confirmation via Purchase Order or Sign.
                        Please do not hesitate to contact us if you need any further clarification.
                        We hope that the above price quoted is reasonable to you and hope to receive your favorable reply soon.
                    </li>
                  </ol>
                </p>
            </td>
          </tr>
        </table>`
      }
    ]
  },
  {
    id: 4,
    section: 'signatureOptionId',
    title: 'Signature',
    description: 'Choose where to display the signature and names will appear for approval.',
    icon: SignIcon,
    options: [
      {
        id: 1,
        description: `The default signature only display Customer's signature.`,
        value: `
        <table>
          <tr>
            <td style="width: 50%">
                <p>Accepted By:</p>
                <br/>
                <br/>
                <br/>
            </td>
          </tr>
          <tr>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
                <p></p>
            </td>
          </tr>
          <tr>
            <td class="large-width">
              <p>Customer's Signature</p>
            </td>
          </tr>
        </table>
        `
      },
      {
        id: 2,
        description: `This option display Customer's signature & Custom signature  .`,
        value: `
        <table style="width: 100%">
          <tr>
            <td style="width: 45%">
              <p>Accepted By:</p>
              <br />
              <br />
              <br />
            </td>
            <td style="width: 10%"></td>
            <td style="width: 45%">
              <p>Prepared By:</p>
              <br />
              <br />
              <br />
            </td>
          </tr>
          <tr>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
              <p></p>
            </td>
            <td></td>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
              <p></p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Customer's Signature</p>
            </td>
            <td></td> <!-- Empty column for spacing -->
            <td>
              <p>Simplify Ptd Ltd</p>
            </td>
          </tr>
        </table>
        `
      },
      {
        id: 3,
        description: `This option display Customer's signature & 2 Custom signature  .`,
        value: `
        <table style="width: 100%">
          <tr>
            <td style="width: 45%">
              <p>Accepted By:</p>
              <br />
              <br />
              <br />
            </td>
            <td style="width: 10%"></td>
            <td style="width: 45%">
              <p>Prepared By:</p>
              <br />
              <br />
              <br />
            </td>
          </tr>
          <tr>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
              <p></p>
            </td>
            <td></td>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
              <p></p>
            </td>
          </tr>
          <tr>
            <td>
              <p>Customer's Signature</p>
            </td>
            <td></td>
            <td>
              <p>Sevice Coordinator</p>
            </td>
          </tr>
          <tr>
            <td style="width: 45%">
              <p></p>
              <br />
              <br />
              <br />
            </td>
            <td style="width: 10%"></td>
            <td style="width: 45%">
              <p>Approved By:</p>
              <br />
              <br />
              <br />
            </td>
          </tr>
          <tr>
            <td>
              <p></p>
            </td>
            <td></td>
            <td style="border-bottom-style: solid; border-width: thin; border-color: grey;">
              <p></p>
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td>
              <p>Head of Department</p>
            </td>
          </tr>
        </table>
        `
      }
    ]
  }
];
