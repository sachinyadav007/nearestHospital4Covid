var nodemailer = require("nodemailer");
let fs = require("fs");
const PDFDocument = require("pdfkit");

//  methode used for getting the list of all vacantBAd hospital in Pdf form

function Pdfconverter(data) {
  let pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream("playlist.pdf"));
  pdfDoc.text(JSON.stringify(data));
  pdfDoc.end();
}
function Sort_distacne(listofdata) {
  listofdata.sort(function (a, b) {
    return a.distance - b.distance;
  });
  return listofdata;
}

//  method used for send the details of nearest hospital BY email
function MailSend(MapUrl, HospitalName, NoOfBads, LAstUpdate, Email) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "akbari201997@gmail.com",
      pass: "gjuni@1999",
    },
  });

  var mailOptions = {
    from: "akbari201997@gmail.com",
    to: ` ${Email}`,
    subject: "Sending Email using Node.js",
    text: `Hospital Location:   ${MapUrl}`,

    attachments: [
      {
        filename: "NearestHospital.txt",
        content: `
        
        
 Googlemapurl:${MapUrl} 
 Hospital Name :  ${HospitalName}  
 VacantBad: ${NoOfBads}

 LastUpdate:${LAstUpdate}

      
               `,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = {
  Sort_distacne,
  Pdfconverter,
  MailSend,
};
