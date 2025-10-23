#set page(paper: "us-letter", margin: (y: 10pt)) 
#show heading: it => [
#set align(center)
#set text(12pt)
  #block(smallcaps(it.body))
]
#let results = csv("input.tmp.csv")
#let results_noheader = results.slice(1)

#align(center + horizon, 
  for results in results_noheader{
    block(breakable: false, width: 100%, [
      = #results.at(0)
      #table(
      columns: (auto, 1fr),
      stroke: (x, y) => (
        left: if x > 0 { 1pt },
        top: if y > 0 { 1pt },
      ),
      [*Course*], [#results.at(1)],
      [*CRN*], [#results.at(2)],
      [*Credit Hours*], [#results.at(3)],
      [*Instructor*], [#results.at(4)],
      [*Email*], [#results.at(5)],
      [*Delivery Method*], [#results.at(6)],
      [*Times*], [#results.at(7)],
      [*Location*], [#results.at(8)],
      [*Start-End*], [#results.at(9)],
      [*Seats Open*], [#results.at(10)],
      [*Waitlist Slots*], [#results.at(11)],
      [*Attributes*], [#results.at(12)],
      )
    ])
  }
)

