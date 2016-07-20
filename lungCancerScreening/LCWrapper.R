source('./LC.R')
library(jsonlite)

#-------------------------------------------------------
# getResults
# 
# Function: Returns the results of the lung cancer screening calculation
#
# Inputs:   A json object containing calculation parameters
#
# Outputs:  A json array in the following format:
#             1) Risk of dying from lung cancer within 5 years in the absence of screening
#             2) Risk reduction due to lung cancer screening 
#             3) The chance of lung cancer diagnosis within 5 years in the absence of screening
#             4) The chance of lung cancer diagnosis within 5 years with screening is result4
#             5) The chance of having a false positive result after 3 screens
#             6) The chance of false-positive CT lung screen
#             7) The path to the generated results file
#
# Example: 
# input  = '{"age": 60, "bmi": 21.52, "cpd": 10, "emp": 1, "fam.lung.trend": 0, "gender": 0, "qtyears": 30, "smkyears": 20, "race": 0, "edu6": 1, "pkyr.cat": 10}'
# output = getResults(input)
#-------------------------------------------------------
getResults <- function(json) {
  output.dir = 'tmp/'
  dir.create(output.dir, showWarnings = F)
  file.name  = paste0(output.dir, 'results_', getTimestamp(), '.txt')
  
  
  input = fromJSON(json)
  if (input$race == 4)
    input$race = 0

  results = c(runLungCancerScreening(age           = input$age,
                                   bmi             = input$bmi,
                                   cpd             = input$cpd,
                                   emp             = input$emp,
                                   fam.lung.trend  = input$fam.lung.trend,
                                   female          = input$gender,
                                   qtyears         = input$qtyears,
                                   smkyears        = input$smkyears,
                                   race            = input$race,
                                   edu6            = input$edu6,
                                   pkyr.cat        = input$pkyr.cat), file.name)
  
  # open file for writing
  sink(file.name)
  cat('Form Summary\n')
  
  # write form summary
  for (key in names(input))
    cat(key, ': ', input[[key]], '\n', sep = '')
  
  # write results summary
  cat('\nResults\n')
  cat('Risk of dying from lung cancer within 5 years in the absence of screening:', results[1], '\n')
  cat('Risk reduction due to lung cancer screening:', results[2], '\n')
  cat('The chance of lung cancer diagnosis within 5 years in the absence of screening:', results[3], '\n')
  cat('The chance of lung cancer diagnosis within 5 years with screening:', results[4], '\n')
  cat('The chance of having a false positive result after 3 screens:', results[5], '\n')
  cat('Chance of false-positive CT lung screen:', results[6], '\n')
  sink()
  
  toJSON(results)
}


#-------------------------------------------------------
# getTimestamp
# 
# Function: Returns a timestamp that includes microseconds
# Outputs:  (1) A character vector representing the current system time
#-------------------------------------------------------
getTimestamp <- function () {
  format(Sys.time(), "%Y%m%d_%H%M%OS6")
}


