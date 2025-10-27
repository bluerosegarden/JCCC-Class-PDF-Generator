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

 const bookmarkletLinkElem = document.getElementById("bookmarklet-clipboard");

 bookmarkletLinkElem.addEventListener("click", copyLinkToCLipboard);

 const copiedNotification = document.getElementById("copied-notif");

 async function copyLinkToCLipboard(){
   bookmarkletLinkElem.setAttribute("icon", "lucide:clipboard-check")
   const minifiedJSResponse = await fetch("../bookmarklet/bookmarklet-minified.js");
   let minifiedLink = await minifiedJSResponse.text();
   navigator.clipboard.writeText(minifiedLink);
   copiedNotification.classList.add("opacity-100")
   setTimeout(() => {
                copiedNotification.classList.
                    remove('opacity-100');
            }, 2500);
   console.log("copied?!")
 }



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

