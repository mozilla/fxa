import SurveyWrapperView from '../views/survey';

export default class SurveyTargeter {
  constructor(options) {
    // map of surveys to views
    this.surveyMap = {};
    options.surveys.filter(this.checkConditions).forEach(s => {
      if (this.surveyMap[s.view]) {
        this.surveyMap[s.view].push(s);
      } else {
        this.surveyMap[s.view] = [s];
      }
    });
  }

  // check conditions will be implemented in #5231
  checkConditions() {
    return true;
  }

  getSurvey(view) {
    const surveysForView = this.surveyMap[view];
    if (surveysForView) {
      // Randomly select a survey that matches the view
      const survey =
        surveysForView[Math.floor(Math.random() * surveysForView.length)];
      return new SurveyWrapperView({ surveyURL: survey.url });
    } else {
      return false;
    }
  }
}
