const version = 1.0;
const domainName = window.location.hostname;
if (domainName == "reg-prod.ec.jccc.edu")
{

    async function mainAsync()
    {
    //setting this to true. Probably should fix this to make more sense
        let versionConfirmation = true;
        let confirmation = false;
        let response = await fetch("https://jccc-class-formatter.bluerose.garden/bookmarklet-ver.json"); 
        let data = await response.json();
    //Check if data.version exists. If it doesn't, set isOutdated to false and let's pretend. Otherwise set it to the bool of version < data.version
        let isOutdated = data.version != undefined ? version < data.version : false;

        //Checks the version and alerts if there's an update
        if(isOutdated)
        {
            versionConfirmation = confirm("BOOKMARKLET IS OUTDATED to ensure proper functionality please update it by copying the new link at https://jccc-class-formatter.bluerose.garden/ \nDo you want to continue to attempt to use the script anyway?")
        }

        if (!isOutdated || (isOutdated && versionConfirmation))
        {
            confirmation = confirm("Are you sure you selected the max results per page? (should be 50)");
        }

    if (confirmation && versionConfirmation)
    {
        var csv_data = [
		    "Title, Course, CRN, Credit Hours,Instructor, Instructor's email, Delivery Method, Times, Location, Start Date-End Date, Seats Open, Waitlist Slots Open, Attributes",
	    ];
	    let timeRE = /\d\d:\d\d  (?:AM|PM) - \d\d:\d\d  (?:AM|PM) (?!Type: Exam)/g;
	    let buildingRE = /(?<!Exam )Building: .*? (?=Room\:)/g;
	    let roomRE = /(?<!\bExam\b.*)Room: .*?(?=Start Date)/g;
	    let daysRE = /(?<!\bExam\b.*)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/g;
	    let startendRE = /(?<!\bExam\b.*) Start Date: \d\d\/\d\d\/\d\d\d\d End Date: \d\d\/\d\d\/\d\d\d\d(?!=None)/g;
	    let emailRE = /(?<="mailto:).*.edu/;
	    let profRE = /(.*),(.*)(\(.*\))/;
        let seatsRE = /(\d{1,})(?: of )(\d{1,})(?: seats )/
        let waitlistRE = /(\d{1,})(?: of )(\d{1,})(?: waitlist )/
	    var rows = document.getElementsByTagName('tr');

	    // Get each row's data
	    for (var i = 1; i < rows.length; i++)
        {
		    // Stores each csv row data
		    var csvrow = [];
            
            //Sets the regex indexes to 0 
            timeRE.lastIndex = 0; 
	        buildingRE.lastIndex = 0;
	        roomRE.lastIndex = 0; 
	        daysRE.lastIndex = 0; 
	        startendRE.lastIndex = 0;
	        emailRE.lastIndex = 0; 
            profRE.lastIndex = 0; 
            seatsRE.lastIndex = 0; 
            waitlistRE.lastIndex = 0; 

            // Get each column's data
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


            //For each dataset in the column
		    for (var j = 0; j < cols.length; j++)
            {
                //Grabbing course title
                if (cols[j].dataset.property == 'courseTitle')
                {
				    //console.log(cols[j])//functions
				    let title = cols[j].textContent;
				    //console.log(title);
				    classInfo.title = title ? title : '';
			    }
                //Grabbing Instructor Info
                else if (cols[j].dataset.property == 'instructor')
                {
				    let emailGrab = [];
				    let profNameArr = profRE.exec(cols[j].textContent);
				    //console.log(profNameArr)
				    let profName = profNameArr?.length > 0 ? `${profNameArr[2].trim()} ${profNameArr[1].trim()} ${profNameArr[3].trim()}` : 'N/A';
				    emailGrab = emailRE.exec(cols[j].innerHTML);
				    let email = emailGrab?.[0] ?? 'N/A';
				    classInfo.instructor = profName;
				    classInfo.email = email;
				    //console.log(profName);
				    //console.log(email)
				    //console.log(cols[j].innerHTML)
			    }
                
                //Grabbing Schedule Info
                else if (cols[j].dataset.property == 'meetingTime')
                {
				    let days = cols[j].title.match(daysRE);
				    days = days ? days.join('') : 'N/A';
				    let time = timeRE.exec(cols[j].textContent);
				    let building = buildingRE.exec(cols[j].title);
				    let room = roomRE.exec(cols[j].title);
				    let startend = startendRE.exec(cols[j].title);
				    classInfo.meetingTimes = time ? `${time} ${days}` : 'N/A';
				    classInfo.location = building ? `${building[0]}` : 'N/A';
				    classInfo.location = room ? `${classInfo.location} ${room[0]}` : 'N/A';
				    classInfo.startend = startend ? startend : 'N/A';

                    //If hybrid, list when online section starts
                    if (classInfo.delivery === "Online Hybrid" || classInfo.delivery === "Hybrid")
                    {
                        let startendSecond = startendRE.exec(cols[j].title);
                        classInfo.startend = `${classInfo.startend} and the online section begins ${startendSecond}`;
                     }
			    }

                else if (cols[j].dataset.property == 'instructionalMethod')
                {
				    classInfo.delivery = cols[j].textContent ? cols[j].textContent : '';
			    }

                else if (cols[j].dataset.property == 'status')
                {
                    let seatsArr = seatsRE.exec(cols[j].title) 
                    let waitlistArr = waitlistRE.exec(cols[j].title) 
                    classInfo.seats = `${seatsArr[1]}/${seatsArr[2]}`
                    classInfo.waitlist = waitlistArr ? `${waitlistArr[1]}/${waitlistArr[2]}` : "N/A"
			    }

                else if (cols[j].dataset.property == 'attribute')
                {
			        let attributes = cols[j].textContent;
				    classInfo.attributes = attributes;
                }

                else if (cols[j].dataset.property == 'subject')
                {
                    let subj = cols[j].textContent;
				    classInfo.subj = subj;
                }

                else if (cols[j].dataset.property == 'creditHours')
                {
                    let hours = cols[j].textContent;
				    classInfo.hours = `${hours}`;
                }
                
                else if (cols[j].dataset.property == 'courseNumber')
                {
                    let courseNum = cols[j].textContent;
				    classInfo.subj = `${classInfo.subj} ${courseNum}`;
                }

                else if (cols[j].dataset.property == 'courseReferenceNumber')
                {
				    let crn = cols[j].textContent;
				    classInfo.crn = crn;
			    } 
		    }

		    // Format the data in CSV 
		    csv_data.push(
			    `${classInfo.title.replaceAll(",", " ")}, ${classInfo.subj.replaceAll(",", " ")}, ${classInfo.crn.replaceAll(",", " ")}, ${classInfo.hours.replaceAll(",", " ")},${classInfo.instructor.replaceAll(",", " ")}, ${classInfo.email.replaceAll(",", " ")}, ${classInfo.delivery.replace(",", " ")}, ${classInfo.meetingTimes.replaceAll(",", " ")}, ${classInfo.location.replaceAll(",", " ")}, ${classInfo.startend}, ${classInfo.seats}, ${classInfo.waitlist}, ${classInfo.attributes.replaceAll(",", " ")}`
		    );
	    }

	    // Joining CSV data together in a single string
	    let joined_csv_data = csv_data.join('\n');

	    // Call this function to download csv file
	    downloadCSVFile(joined_csv_data);

	    function downloadCSVFile(csv_data)
        {
		    // Create CSV file object and feed
		    // our csv_data into it
		    let CSVFile = new Blob([csv_data], {type: 'text/csv',});

		    // Create to temporary link to download
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
    }
    }

    mainAsync()
}
else
{
    alert("You must be on JCCC with the class query already searched!")
}
