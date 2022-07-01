const puppeteer = require("puppeteer");

const sendemail = require("./Sendemail");

let cTab;

let UrlBad;
let listofdata;

(async function main() {
  try {
    let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    browser = await browser;
    let allTabsArr = await browser.pages();

    cTab = allTabsArr[0];

    //  Deactivate the waiting time limit for Selector
    await cTab.setDefaultNavigationTimeout(0);

    //  Go on the delhi covie website
    await cTab.goto("https://coronabeds.jantasamvad.org/");

    // Waiting  for loading the bad deatiled
    await cTab.waitForSelector(".col>a", { visible: true });

    const PageLinkforVacantBed = await cTab.evaluate(() =>
      Array.from(document.querySelectorAll(".col>a")).map(
        (anchor) => anchor.href
      )
    );
    UrlBad = PageLinkforVacantBed[0];

    // Go to page of Vacent bad Hospital Lit
    await cTab.goto(UrlBad);

    // wainting for appear Hospital detail
    await cTab.waitForSelector(".table-success", { visible: true });

    // Get the List of VacantBad Detail by exctuing the function on Console
    listofdata = await cTab.evaluate(
      fConsoleFn,
      ".table-success",
      ".table-success th a"
    );

    // for going first time on Google map for Calculating the the Nearest Hospital
    let Firsturl = listofdata[0]["Googlemapurl"];
    await CalculateMinDistace_FirstTme(Firsturl);

    //   for going Reaming time on Google map for Calculating the the Nearest Hospital
    await CalculateMinDistace_remaining();
  } catch (err) {
    // for Hancle If any error comes
    console.log(err);
  }
})();

async function CalculateMinDistace_remaining() {
  for (i = 1; i < listofdata.length; i++) {
    let Hospitalname = listofdata[i]["HospitalNAme"];

    //   waiting for appearing the Conten of Given Selector
    await cTab.click("#directions-searchbox-1");

    // timeing Hospital Name on Ggoogle map for calculate Distance
    await cTab.type("#directions-searchbox-1", Hospitalname, {
      delay: 10,
    });

    //  preess eneter by Keyboard
    await cTab.keyboard.press("Enter");

    // waiting for appearing the Conten of Given Selector
    await cTab.waitForSelector(
      ".section-directions-trip-distance.section-directions-trip-secondary-text div",
      { visible: true }
    );

    let distancearray = await cTab.evaluate(FindDistaceTaken);

    //  For getting the Distance Form DOm
    let MinimumDistace = ConverDistaceString_to_Intger(distancearray);

    //   stroring Dsiatce  from your location corrposiding to your hospital
    listofdata[i].distance = MinimumDistace;
  }

  //  for Soriing accorint to Distance
  listofdata = sendemail.Sort_distacne(listofdata);
  // console.log("Data after Sorted According tO Distance");

  //  for converint the all Hospital into pdf form
  sendemail.Pdfconverter(listofdata);

  // console.log("asd" + listofdata[0]["HospitalNAme"]);

  //  for Sending the Email of nearest Hospital
  sendemail.MailSend(
    listofdata[0]["Googlemapurl"],
    listofdata[0]["HospitalNAme"],
    listofdata[0]["VacantBad"],
    listofdata[0]["LastUpdate"],
    "aditya170010130095@gmail.com"
  );
}

//  for getting the Lsit of hospital  and corrposond other Detail Ecuting on the Broweser console
function fConsoleFn(Bedselector, helpSelector) {
  let vacanthosspital = document.querySelectorAll(Bedselector);

  let list = [];
  for (let i = 0; i < vacanthosspital.length - 1; i++) {
    let url = document.querySelectorAll(helpSelector)[2 * i].href;

    //  for getting Hsopital name bo  broweser console
    let HospitalNAme = document.querySelectorAll(helpSelector)[2 * i + 1].text;

    // for getting VacantBed  broweser console
    let VacantBad = document.querySelectorAll(".table-success td a")[4 * i + 2]
      .text;

    // for getting Lastupdate  broweser console

    let LastUpdate = document.querySelectorAll(".table-success td a")[4 * i]
      .text;

    list.push({ Googlemapurl: url, HospitalNAme, VacantBad, LastUpdate });
  }
  return list;
}

async function CalculateMinDistace_FirstTme(url) {
  await cTab.goto(url);

  // / waiting for appearing the Conten of Given Selector
  await cTab.waitForSelector(
    ".iRxY3GoUYUY__button.gm2-hairline-border.section-action-chip-button",
    { visible: true }
  );

  await cTab.click(
    ".iRxY3GoUYUY__button.gm2-hairline-border.section-action-chip-button"
  )[0];

  // / waiting for appearing the Conten of Given Selector

  await cTab.waitForSelector("#directions-searchbox-0", { visible: true });

  await cTab.type("#directions-searchbox-0", "isbt kasmaere gate", {
    delay: 10,
  });
  await cTab.keyboard.press("Enter");

  // / waiting for appearing the Conten of Given Selector
  await cTab.waitForSelector(
    ".section-directions-trip-distance.section-directions-trip-secondary-text div",
    { visible: true }
  );
  // for calculate the distacne form yoru location
  let distancearray = await cTab.evaluate(FindDistaceTaken);

  // for converintg String ditacne into INteger form
  let MinimumDistace = ConverDistaceString_to_Intger(distancearray);

  // for update the list of fir hospital distace
  listofdata[0].distance = MinimumDistace;
}

// for converting distace in integer form
function ConverDistaceString_to_Intger(distance) {
  let dataWithoutspace = distance.split(" ")[0];

  distance = dataWithoutspace;

  distance = parseInt(distance);
  return distance;
}
function FindDistaceTaken() {
  //  for calcualting
  let data = document.querySelectorAll(
    ".section-directions-trip-distance.section-directions-trip-secondary-text div"
  )[0].textContent;

  return data;
}
