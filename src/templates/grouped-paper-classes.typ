

#show heading: it => [
#set align(center)

  #block(smallcaps(it.body))
]

#show table: it => [
  #set text(12pt)
  #it
]
#show heading.where(level:1): it=>[
  #set text(20pt)
  #set align(center)
  #block(smallcaps(it.body))
] 

#show heading.where(level:2): it=>[
  #set text(15pt)
  #set align(center)
  #block(upper(it.body))
] 

#let results = csv("input.tmp.csv")
#let results_noheader = results.slice(1)
#let results_noheader = results_noheader.map(x=>{x.map(y=>{y.trim(" ")})})

#let prevCheckedPage = context here().page()

#let GenClassTableBlock(blockInfo, class) = {
  align(start)[
          #block(breakable: false)[
            #if blockInfo != none{
              [#blockInfo]
            }
          #table(
          columns: (auto, 1fr),
          stroke: (x, y) => (
            left: if x > 0 { 1pt },
            top: if y > 0 { 1pt },
          ),
          [*CRN*], [#class.at(0)],
          [*Delivery Method*], [#class.at(1)],
          [*Times*], [#class.at(2)],
          [*Location*], [#class.at(3)],
          [*Start-End*], [#class.at(4)],
          [*Seats Open*], [#class.at(5)],
          [*Waitlist Slots*], [#class.at(6)],
          [*Attributes*], [#class.at(7)],
  
        )
      ]
        ]
}



#let groupClasses(classes) = {
  let courseDict = (:)

  for class in classes{
    let credit_hours = class.remove(3)
    let course = class.remove(1)
    let name = class.remove(0)
    let classInfo = class
    

    if courseDict.at(course, default:false) == false{
      courseDict.insert(course, (name: name, credit_hours:credit_hours, classOptions: (classInfo,)))
    }
    else{
      courseDict.at(course).classOptions.push(classInfo)
      
    }
  }
  return courseDict
}



#let groupByProfs(classes) = {
  let profDict = (:)

  for class in classes{
    if class.at(4) != "N/A" {
      let profEmail = class.remove(5)
      let profName = class.remove(4)
      let classInfo = class
      if profDict.at(profName, default: false) == false{
        profDict.insert(
          profName, (
            email: profEmail,
            courses: (classInfo,)
          )
          
        )
      }
      else{
        profDict.at(profName).courses.push((classInfo))
      }
    }
  }
  for key in profDict.keys(){
    profDict.at(key).courses = groupClasses(profDict.at(key).courses)
  }
  return profDict
}

#let profDict = groupByProfs(results_noheader)

#let checkIfSingleCourse(profDict) = {
  let courses = ()
  let course_name = ""
  let course_credit_hours = ""
  for key in profDict.keys(){
    for course in profDict.at(key).courses.keys(){
      courses.push(course)
      course_name = profDict.at(key).courses.at(course).name
      course_credit_hours = profDict.at(key).courses.at(course).credit_hours
    }

  }

  courses = courses.flatten()

  let previous_course = ""

  for course in courses {
    if previous_course == ""{
      previous_course = course
      continue
    }
    if previous_course != course{
      return (false, previous_course, course_name, course_credit_hours)
    }
    else{
      previous_course = course
    }
  }

  return (true, previous_course, course_name, course_credit_hours)
}

#let (is_single_course, single_course, single_course_name, single_credit_hours) = checkIfSingleCourse(profDict)

#set page(paper: "us-letter", margin: (y: 24pt),
header: context {
  if counter(page).get().first() > 1 [
    #h(1fr)
    #if is_single_course [#single_course_name (#single_course)]
  ]
})

#let already_printed_className = false
#if is_single_course{ 
            align(center, block(below: 40pt)[
              = #text(25pt)[#single_course_name (#single_course)]
              #text(18pt)[Credit Hours: #single_credit_hours]
            ]
          )
}

#let prevCheckedPage = state("x", 1)


#align(center, 
  [
    #for prof_name in profDict.keys(){
      
      let new_professor = true
      let courses = profDict.at(prof_name).courses
      let email = profDict.at(prof_name).email
      let new_page = false
      
      for course in courses.keys(){
        let course_name = courses.at(course).name
        let credit_hours = courses.at(course).credit_hours
        let first_class_of_course = true

        
        for class in courses.at(course).classOptions{
          context {
          let courseInfo = []
          let blockInfo = []          
          let profInfo = block()[
                = #text(25pt)[#prof_name]
                #text(18pt)[#email]]
          
          
            let same_page = here().page() == prevCheckedPage.get()
            let oneline_info = [🡄 * #prof_name || #course_name (#course) || Credit Hours: #credit_hours *]

            let oneline_info_simple = [🡄* #prof_name *]
            let courseInfo = [
              == #course_name (#course)
              #text(18pt)[Credit Hours: #courses.at(course).credit_hours]
            ]
            let blockInfo = []
            if new_professor {
              if is_single_course{
                blockInfo = align(center, block(breakable: false)[
            #profInfo
          ])
         
              }else {
              blockInfo = align(center, block(breakable: false)[
            #profInfo
            #courseInfo
          ])
        }
            } else if first_class_of_course and not is_single_course{
                blockInfo = align(center, block(breakable: false)[
                 #courseInfo
                ])
            } else if not same_page{
              if is_single_course{
                blockInfo = oneline_info_simple
              } else {
              blockInfo = oneline_info
          }
            }
            
          GenClassTableBlock(blockInfo, class)
          prevCheckedPage.update(here().page())
        }
        
        new_professor = false
        first_class_of_course = false
      } 
      }
      
    }
  ]
)


