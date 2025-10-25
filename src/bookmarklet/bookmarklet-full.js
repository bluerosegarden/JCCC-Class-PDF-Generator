let domainName = window.location.hostname;
console.log(domainName);
if (domainName == "reg-prod.ec.jccc.edu"){
let confirmation = confirm("Are you sure you selected the max results per page? (should be 50)");
if (confirmation){
var csv_data = [
		"Title, Course, CRN, Credit Hours,Instructor, Instructor's email, Delivery Method, Times, Location, Start Date-End Date, Seats Open, Waitlist Slots Open, Attributes",
	];
	let timeRE = /\d\d:\d\d  (?:AM|PM) - \d\d:\d\d  (?:AM|PM) (?!Type: Exam)/g;
	let buildingRE = /(?<!Exam )Building: .*? (?=Room\:)/g;
	let roomRE = /(?<!\bExam\b.*)Room: .*?(?=Start Date)/g;
	let daysRE = /(?<!\bExam\b.*)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/g;
	let startendRE =
		/(?<!\bExam\b.*) Start Date: \d\d\/\d\d\/\d\d\d\d End Date: \d\d\/\d\d\/\d\d\d\d(?!=None)/g;
	let emailRE = /(?<="mailto:).*.edu/;
	let profRE = /(.*),(.*)(\(.*\))/;
        let seatsRE = /(\d{1,})(?: of )(\d{1,})(?: seats )/
        let waitlistRE = /(\d{1,})(?: of )(\d{1,})(?: waitlist )/
	// Get each row data
	var rows = document.getElementsByTagName('tr');
	for (var i = 1; i < rows.length; i++) {
		// Get each column data
		var cols = rows[i].querySelectorAll('td,th');
		let classInfo = {
			title: '',
			instructor: '',
			delivery: '',
			email: '',
			meetingTimes: '',
			location: '',
			startend: '',
			crn: '',
                        seats: '',
                        waitlist: '',
                        attributes: '',
                        subj:'',
                        hours: '',
		};
        timeRE.lastIndex = 0; 
	buildingRE.lastIndex = 0;
	roomRE.lastIndex = 0; 
	daysRE.lastIndex = 0; 
	startendRE.lastIndex = 0;
	emailRE.lastIndex = 0; 
        profRE.lastIndex = 0; 
        seatsRE.lastIndex = 0; 
        waitlistRE.lastIndex = 0; 

		// Stores each csv row data
		var csvrow = [];
		for (var j = 0; j < cols.length; j++) {
			if (cols[j].dataset.property == 'courseTitle') {
				//console.log(cols[j])
				let title = cols[j].textContent;
				//console.log(title);
				classInfo.title = title ? title : '';
			} else if (cols[j].dataset.property == 'instructor') {
				let emailGrab = [];
				let profNameArr = profRE.exec(cols[j].textContent);
				//console.log(profNameArr)
				let profName =
					profNameArr?.length > 0
						? `${profNameArr[2].trim()} ${profNameArr[1].trim()} ${profNameArr[3].trim()}`
						: 'N/A';
				emailGrab = emailRE.exec(cols[j].innerHTML);
				let email = emailGrab?.[0] ?? 'N/A';
				classInfo.instructor = profName;
				classInfo.email = email;
				//console.log(profName);
				//console.log(email)
				//console.log(cols[j].innerHTML)
			} else if (cols[j].dataset.property == 'meetingTime') {
				//console.log(cols[j].title);
				let days = cols[j].title.match(daysRE);
				days = days ? days.join('') : 'N/A';
				//console.log(days);
				//console.log(days)
				let time = timeRE.exec(cols[j].textContent);
				let building = buildingRE.exec(cols[j].title);
				let room = roomRE.exec(cols[j].title);
				let startend = startendRE.exec(cols[j].title);
				// console.log({building});
				// console.log({room});
				// console.log({startend});
				// console.log({time});
				classInfo.meetingTimes = time ? `${time} ${days}` : 'N/A';
				classInfo.location = building ? `${building[0]}` : 'N/A';
				classInfo.location = room ? `${classInfo.location} ${room[0]}` : 'N/A';
				classInfo.startend = startend ? startend : 'N/A';
                                if (classInfo.delivery === "Online Hybrid"||classInfo.delivery === "Hybrid"){
                                    let startendSecond = startendRE.exec(cols[j].title);
                                     classInfo.startend = `${classInfo.startend} and the online section begins ${startendSecond}`
                                console.log(building)
                    
                                }

			} else if (cols[j].dataset.property == 'instructionalMethod') {
				classInfo.delivery = cols[j].textContent ? cols[j].textContent : '';
			} else if (cols[j].dataset.property == 'status') {
                            let seatsArr = seatsRE.exec(cols[j].title) 
                            let waitlistArr = waitlistRE.exec(cols[j].title) 
                            classInfo.seats = `${seatsArr[1]}/${seatsArr[2]}`
                            classInfo.waitlist = waitlistArr ? `${waitlistArr[1]}/${waitlistArr[2]}` : "N/A"
			} else if (cols[j].dataset.property == 'attribute') {
			        let attributes = cols[j].textContent;
				classInfo.attributes = attributes;
                        } else if (cols[j].dataset.property == 'subject') {
                                let subj = cols[j].textContent;
				classInfo.subj = subj;

                        } else if (cols[j].dataset.property == 'creditHours') {
                                let hours = cols[j].textContent;
				classInfo.hours = `${hours}`;

                        } else if (cols[j].dataset.property == 'courseNumber') {
                                let courseNum = cols[j].textContent;
				classInfo.subj = `${classInfo.subj} ${courseNum}`;
                        
                        } else if (cols[j].dataset.property == 'courseReferenceNumber') {
				let crn = cols[j].textContent;
				classInfo.crn = crn;
			} 
			// Get the text data of each cell
			// of a row and push it to csvrow
			//csvrow.push(cols[j].innerHTML);
			//console.log(textArr);
		}

		// Combine each column value with comma
		csv_data.push(
			`${classInfo.title.replaceAll(",", " ")}, ${classInfo.subj.replaceAll(",", " ")}, ${classInfo.crn.replaceAll(",", " ")}, ${classInfo.hours.replaceAll(",", " ")},${classInfo.instructor.replaceAll(",", " ")}, ${classInfo.email.replaceAll(",", " ")}, ${classInfo.delivery.replace(",", " ")}, ${classInfo.meetingTimes.replaceAll(",", " ")}, ${classInfo.location.replaceAll(",", " ")}, ${classInfo.startend}, ${classInfo.seats}, ${classInfo.waitlist}, ${classInfo.attributes.replaceAll(",", " ")}`
		);
	}

	// Combine each row data with new line character
	csv_data = csv_data.join('\n');

	// Call this function to download csv file
	downloadCSVFile(csv_data);

	function downloadCSVFile(csv_data) {
		// Create CSV file object and feed
		// our csv_data into it
		let CSVFile = new Blob([csv_data], {
			type: 'text/csv',
		});

		// Create to temporary link to initiate
		// download process
		var temp_link = document.createElement('a');

		// Download csv file
		temp_link.download = 'classes.csv';
		var url = window.URL.createObjectURL(CSVFile);
		temp_link.href = url;

		// This link should not be displayed
		temp_link.style.display = 'none';
		document.body.appendChild(temp_link);

		// Automatically click the link to
		// trigger download
		temp_link.click();
		document.body.removeChild(temp_link);
        
    }	
}}
else{
alert("You must be on JCCC with the class query already searched!")
}
