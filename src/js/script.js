 const input = document.getElementById('input');
 const uploaded_files = document.getElementById("file-input");
 const preview_button = document.getElementById("preview-button");
 const isGrouped = document.getElementById("groupedCheckbox")
 let combined_csv_files = "";
const contentDiv = document.getElementById('content');


    // Exports SVG and puts it into the `contentDiv`
    const previewSvg = mainContent => {
      $typst.svg({ mainContent }).then(svg => {
        console.log(`rendered! SvgElement { len: ${svg.length} }`);
        // append svg text
        contentDiv.innerHTML = svg;

        contentDiv.className = contentDiv.className.replace("invisible", "")

        const svgElem = contentDiv.firstElementChild;
        const width = Number.parseFloat(svgElem.getAttribute('width'));
        const height = Number.parseFloat(svgElem.getAttribute('height'));
        const cw = document.body.clientWidth - 200;
        svgElem.setAttribute('width', cw);
        svgElem.setAttribute('height', (height * cw) / width);
      });
    };

    // Exports PDF and downloads it
    const exportPdf = mainContent =>
      $typst.pdf({ mainContent }).then(pdfData => {
        var pdfFile = new Blob([pdfData], { type: 'application/pdf' });
     pdfFile.name = "classes.pdf"

        // Creates element with <a> tag
        const link = document.createElement('a');
        // Sets file content in the object URL
        link.href = URL.createObjectURL(pdfFile);
        // Sets file name
        link.target = '_blank';
        link.download = "classes.pdf"
        // Triggers a click event to <a> tag to save file.
        link.click();
        //URL.revokeObjectURL(link.href);
      });

    /// Listens the 'load' event to initialize after loaded the bundle file from CDN (jsdelivr).
    document.getElementById('typst').addEventListener('load', function () {
      /// Initializes the Typst compiler and renderer. Since we use "all-in-one-lite.bundle.js" instead of
      /// "all-in-one.bundle.js" we need to tell that the wasm module files can be loaded from CDN (jsdelivr).
      $typst.setCompilerInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
      });
      $typst.setRendererInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
      });

      /// Binds exportPdf action to the button
      document.getElementById('export').addEventListener("click", processPDF);
      /// Binds previewSvg action to the textarea
    });


async function processFiles(){
   const fileList = uploaded_files.files;
   let csv_text = "";

   csv_text += await fileList[0].text();

   if (fileList.length > 1){
     for (let i = 1; i < fileList.length; i++){
       console.log(`${i} loop`)
       let file_text = await fileList[i].text()
       let split_file = file_text.split("\n");
       split_file.splice(0,1);
       let headerless_file = split_file.join("\n");
       csv_text += "\n"+headerless_file;
     }
   }
   
   let typ_file = formatTemplate(csv_text);
   combined_csv_files = formatTemplate;
   return typ_file
 }

 async function previewFile(){
   let typ_file = await processFiles();
   previewSvg(typ_file)
 }

 async function processPDF(){
   let typ_file = await processFiles();
   exportPdf(typ_file)
 }

 preview_button.addEventListener("click", previewFile);

 groupedCheckbox.addEventListener("change", previewFile);

 document.getElementById("bookmarklet").href = bookmarkletLink();


 async function formatTemplate(csvFile){
   if(groupedCheckbox.checked){
     const grouped_response = await fetch("../templates/grouped-paper-classes.typ");
     let grouped_text = await grouped_response.text();
     grouped_text = grouped_text.replace("\"input.tmp.csv\"", `bytes("${csvFile}")`)
     return grouped_text
   }
   else{
     const ungrouped_response = await fetch("../templates/paper-classes.typ");
     let ungrouped_text = await ungrouped_response.text();
     ungrouped_text = ungrouped_text.replace("\"input.tmp.csv\"", `bytes("${csvFile}")`)
     return ungrouped_text
   }
 }


 function bookmarkletLink(){
   return "javascript:(function()%7Blet%20domainName%20%3D%20window.location.hostname%3B%0Aconsole.log(domainName)%3B%0Aif%20(domainName%20%3D%3D%20%22reg-prod.ec.jccc.edu%22)%7B%0Alet%20confirmation%20%3D%20confirm(%22Are%20you%20sure%20you%20selected%20the%20max%20results%20per%20page%3F%20(should%20be%2050)%22)%3B%0Aif%20(confirmation)%7B%0Avar%20csv_data%20%3D%20%5B%0A%09%09%22Title%2C%20Course%2C%20CRN%2C%20Credit%20Hours%2CInstructor%2C%20Instructor's%20email%2C%20Delivery%20Method%2C%20Times%2C%20Location%2C%20Start%20Date-End%20Date%2C%20Seats%20Open%2C%20Waitlist%20Slots%20Open%2C%20Attributes%22%2C%0A%09%5D%3B%0A%09let%20timeRE%20%3D%20%2F%5Cd%5Cd%3A%5Cd%5Cd%20%20(%3F%3AAM%7CPM)%20-%20%5Cd%5Cd%3A%5Cd%5Cd%20%20(%3F%3AAM%7CPM)%20(%3F!Type%3A%C2%A0Exam)%2Fg%3B%0A%09let%20buildingRE%20%3D%20%2F(%3F%3C!Exam%20)Building%3A%20.*%3F%20(%3F%3DRoom%5C%3A)%2Fg%3B%0A%09let%20roomRE%20%3D%20%2F(%3F%3C!%5CbExam%5Cb.*)Room%3A%20.*%3F(%3F%3DStart%20Date)%2Fg%3B%0A%09let%20daysRE%20%3D%20%2F(%3F%3C!%5CbExam%5Cb.*)(Sun%7CMon%7CTue%7CWed%7CThu%7CFri%7CSat)%2Fg%3B%0A%09let%20startendRE%20%3D%0A%09%09%2F(%3F%3C!%5CbExam%5Cb.*)%20Start%20Date%3A%20%5Cd%5Cd%5C%2F%5Cd%5Cd%5C%2F%5Cd%5Cd%5Cd%5Cd%20End%20Date%3A%20%5Cd%5Cd%5C%2F%5Cd%5Cd%5C%2F%5Cd%5Cd%5Cd%5Cd(%3F!%3DNone)%2Fg%3B%0A%09let%20emailRE%20%3D%20%2F(%3F%3C%3D%22mailto%3A).*.edu%2F%3B%0A%09let%20profRE%20%3D%20%2F(.*)%2C(.*)(%5C(.*%5C))%2F%3B%0A%20%20%20%20%20%20%20%20let%20seatsRE%20%3D%20%2F(%5Cd%7B1%2C%7D)(%3F%3A%20of%20)(%5Cd%7B1%2C%7D)(%3F%3A%20seats%20)%2F%0A%20%20%20%20%20%20%20%20let%20waitlistRE%20%3D%20%2F(%5Cd%7B1%2C%7D)(%3F%3A%20of%20)(%5Cd%7B1%2C%7D)(%3F%3A%20waitlist%20)%2F%0A%09%2F%2F%20Get%20each%20row%20data%0A%09var%20rows%20%3D%20document.getElementsByTagName('tr')%3B%0A%09for%20(var%20i%20%3D%201%3B%20i%20%3C%20rows.length%3B%20i%2B%2B)%20%7B%0A%09%09%2F%2F%20Get%20each%20column%20data%0A%09%09var%20cols%20%3D%20rows%5Bi%5D.querySelectorAll('td%2Cth')%3B%0A%09%09let%20classInfo%20%3D%20%7B%0A%09%09%09title%3A%20''%2C%0A%09%09%09instructor%3A%20''%2C%0A%09%09%09delivery%3A%20''%2C%0A%09%09%09email%3A%20''%2C%0A%09%09%09meetingTimes%3A%20''%2C%0A%09%09%09location%3A%20''%2C%0A%09%09%09startend%3A%20''%2C%0A%09%09%09crn%3A%20''%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20seats%3A%20''%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20waitlist%3A%20''%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20attributes%3A%20''%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20subj%3A''%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hours%3A%20''%2C%0A%09%09%7D%3B%0A%20%20%20%20%20%20%20%20timeRE.lastIndex%20%3D%200%3B%20%0A%09buildingRE.lastIndex%20%3D%200%3B%0A%09roomRE.lastIndex%20%3D%200%3B%20%0A%09daysRE.lastIndex%20%3D%200%3B%20%0A%09startendRE.lastIndex%20%3D%200%3B%0A%09emailRE.lastIndex%20%3D%200%3B%20%0A%20%20%20%20%20%20%20%20profRE.lastIndex%20%3D%200%3B%20%0A%20%20%20%20%20%20%20%20seatsRE.lastIndex%20%3D%200%3B%20%0A%20%20%20%20%20%20%20%20waitlistRE.lastIndex%20%3D%200%3B%20%0A%0A%09%09%2F%2F%20Stores%20each%20csv%20row%20data%0A%09%09var%20csvrow%20%3D%20%5B%5D%3B%0A%09%09for%20(var%20j%20%3D%200%3B%20j%20%3C%20cols.length%3B%20j%2B%2B)%20%7B%0A%09%09%09if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'courseTitle')%20%7B%0A%09%09%09%09%2F%2Fconsole.log(cols%5Bj%5D)%0A%09%09%09%09let%20title%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09%2F%2Fconsole.log(title)%3B%0A%09%09%09%09classInfo.title%20%3D%20title%20%3F%20title%20%3A%20''%3B%0A%09%09%09%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'instructor')%20%7B%0A%09%09%09%09let%20emailGrab%20%3D%20%5B%5D%3B%0A%09%09%09%09let%20profNameArr%20%3D%20profRE.exec(cols%5Bj%5D.textContent)%3B%0A%09%09%09%09%2F%2Fconsole.log(profNameArr)%0A%09%09%09%09let%20profName%20%3D%0A%09%09%09%09%09profNameArr%3F.length%20%3E%200%0A%09%09%09%09%09%09%3F%20%60%24%7BprofNameArr%5B2%5D.trim()%7D%20%24%7BprofNameArr%5B1%5D.trim()%7D%20%24%7BprofNameArr%5B3%5D.trim()%7D%60%0A%09%09%09%09%09%09%3A%20'N%2FA'%3B%0A%09%09%09%09emailGrab%20%3D%20emailRE.exec(cols%5Bj%5D.innerHTML)%3B%0A%09%09%09%09let%20email%20%3D%20emailGrab%3F.%5B0%5D%20%3F%3F%20'N%2FA'%3B%0A%09%09%09%09classInfo.instructor%20%3D%20profName%3B%0A%09%09%09%09classInfo.email%20%3D%20email%3B%0A%09%09%09%09%2F%2Fconsole.log(profName)%3B%0A%09%09%09%09%2F%2Fconsole.log(email)%0A%09%09%09%09%2F%2Fconsole.log(cols%5Bj%5D.innerHTML)%0A%09%09%09%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'meetingTime')%20%7B%0A%09%09%09%09%2F%2Fconsole.log(cols%5Bj%5D.title)%3B%0A%09%09%09%09let%20days%20%3D%20cols%5Bj%5D.title.match(daysRE)%3B%0A%09%09%09%09days%20%3D%20days%20%3F%20days.join('')%20%3A%20'N%2FA'%3B%0A%09%09%09%09%2F%2Fconsole.log(days)%3B%0A%09%09%09%09%2F%2Fconsole.log(days)%0A%09%09%09%09let%20time%20%3D%20timeRE.exec(cols%5Bj%5D.textContent)%3B%0A%09%09%09%09let%20building%20%3D%20buildingRE.exec(cols%5Bj%5D.title)%3B%0A%09%09%09%09let%20room%20%3D%20roomRE.exec(cols%5Bj%5D.title)%3B%0A%09%09%09%09let%20startend%20%3D%20startendRE.exec(cols%5Bj%5D.title)%3B%0A%09%09%09%09%2F%2F%20console.log(%7Bbuilding%7D)%3B%0A%09%09%09%09%2F%2F%20console.log(%7Broom%7D)%3B%0A%09%09%09%09%2F%2F%20console.log(%7Bstartend%7D)%3B%0A%09%09%09%09%2F%2F%20console.log(%7Btime%7D)%3B%0A%09%09%09%09classInfo.meetingTimes%20%3D%20time%20%3F%20%60%24%7Btime%7D%20%24%7Bdays%7D%60%20%3A%20'N%2FA'%3B%0A%09%09%09%09classInfo.location%20%3D%20building%20%3F%20%60%24%7Bbuilding%5B0%5D%7D%60%20%3A%20'N%2FA'%3B%0A%09%09%09%09classInfo.location%20%3D%20room%20%3F%20%60%24%7BclassInfo.location%7D%20%24%7Broom%5B0%5D%7D%60%20%3A%20'N%2FA'%3B%0A%09%09%09%09classInfo.startend%20%3D%20startend%20%3F%20startend%20%3A%20'N%2FA'%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(classInfo.delivery%20%3D%3D%3D%20%22Online%20Hybrid%22%7C%7CclassInfo.delivery%20%3D%3D%3D%20%22Hybrid%22)%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20startendSecond%20%3D%20startendRE.exec(cols%5Bj%5D.title)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20classInfo.startend%20%3D%20%60%24%7BclassInfo.startend%7D%20and%20the%20online%20section%20begins%20%24%7BstartendSecond%7D%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20console.log(building)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%09%09%09%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'instructionalMethod')%20%7B%0A%09%09%09%09classInfo.delivery%20%3D%20cols%5Bj%5D.textContent%20%3F%20cols%5Bj%5D.textContent%20%3A%20''%3B%0A%09%09%09%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'status')%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20seatsArr%20%3D%20seatsRE.exec(cols%5Bj%5D.title)%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20waitlistArr%20%3D%20waitlistRE.exec(cols%5Bj%5D.title)%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20classInfo.seats%20%3D%20%60%24%7BseatsArr%5B1%5D%7D%2F%24%7BseatsArr%5B2%5D%7D%60%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20classInfo.waitlist%20%3D%20waitlistArr%20%3F%20%60%24%7BwaitlistArr%5B1%5D%7D%2F%24%7BwaitlistArr%5B2%5D%7D%60%20%3A%20%22N%2FA%22%0A%09%09%09%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'attribute')%20%7B%0A%09%09%09%20%20%20%20%20%20%20%20let%20attributes%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09classInfo.attributes%20%3D%20attributes%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'subject')%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20subj%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09classInfo.subj%20%3D%20subj%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'creditHours')%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20hours%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09classInfo.hours%20%3D%20%60%24%7Bhours%7D%60%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'courseNumber')%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20let%20courseNum%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09classInfo.subj%20%3D%20%60%24%7BclassInfo.subj%7D%20%24%7BcourseNum%7D%60%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(cols%5Bj%5D.dataset.property%20%3D%3D%20'courseReferenceNumber')%20%7B%0A%09%09%09%09let%20crn%20%3D%20cols%5Bj%5D.textContent%3B%0A%09%09%09%09classInfo.crn%20%3D%20crn%3B%0A%09%09%09%7D%20%0A%09%09%09%2F%2F%20Get%20the%20text%20data%20of%20each%20cell%0A%09%09%09%2F%2F%20of%20a%20row%20and%20push%20it%20to%20csvrow%0A%09%09%09%2F%2Fcsvrow.push(cols%5Bj%5D.innerHTML)%3B%0A%09%09%09%2F%2Fconsole.log(textArr)%3B%0A%09%09%7D%0A%0A%09%09%2F%2F%20Combine%20each%20column%20value%20with%20comma%0A%09%09csv_data.push(%0A%09%09%09%60%24%7BclassInfo.title.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.subj.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.crn.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.hours.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%24%7BclassInfo.instructor.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.email.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.delivery.replace(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.meetingTimes.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.location.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%2C%20%24%7BclassInfo.startend%7D%2C%20%24%7BclassInfo.seats%7D%2C%20%24%7BclassInfo.waitlist%7D%2C%20%24%7BclassInfo.attributes.replaceAll(%22%2C%22%2C%20%22%20%22)%7D%60%0A%09%09)%3B%0A%09%7D%0A%0A%09%2F%2F%20Combine%20each%20row%20data%20with%20new%20line%20character%0A%09csv_data%20%3D%20csv_data.join('%5Cn')%3B%0A%0A%09%2F%2F%20Call%20this%20function%20to%20download%20csv%20file%0A%09downloadCSVFile(csv_data)%3B%0A%0A%09function%20downloadCSVFile(csv_data)%20%7B%0A%09%09%2F%2F%20Create%20CSV%20file%20object%20and%20feed%0A%09%09%2F%2F%20our%20csv_data%20into%20it%0A%09%09let%20CSVFile%20%3D%20new%20Blob(%5Bcsv_data%5D%2C%20%7B%0A%09%09%09type%3A%20'text%2Fcsv'%2C%0A%09%09%7D)%3B%0A%0A%09%09%2F%2F%20Create%20to%20temporary%20link%20to%20initiate%0A%09%09%2F%2F%20download%20process%0A%09%09var%20temp_link%20%3D%20document.createElement('a')%3B%0A%0A%09%09%2F%2F%20Download%20csv%20file%0A%09%09temp_link.download%20%3D%20'classes.csv'%3B%0A%09%09var%20url%20%3D%20window.URL.createObjectURL(CSVFile)%3B%0A%09%09temp_link.href%20%3D%20url%3B%0A%0A%09%09%2F%2F%20This%20link%20should%20not%20be%20displayed%0A%09%09temp_link.style.display%20%3D%20'none'%3B%0A%09%09document.body.appendChild(temp_link)%3B%0A%0A%09%09%2F%2F%20Automatically%20click%20the%20link%20to%0A%09%09%2F%2F%20trigger%20download%0A%09%09temp_link.click()%3B%0A%09%09document.body.removeChild(temp_link)%3B%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%7D%09%0A%7D%7D%0Aelse%7B%0Aalert(%22You%20must%20be%20on%20JCCC%20with%20the%20class%20query%20already%20searched!%22)%0A%7D%7D)()%3B"
 }
