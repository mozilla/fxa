import SurveyWrapperView from '../views/survey';
import Storage from './storage';

export default class SurveyTargeter {
  constructor(options) {
    // map of surveys to views
    this.surveyMap = {};
    this._storage = Storage.factory('localStorage', options.window);
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
      this._storage.set('lastSurvey', Date.now());
      return new SurveyWrapperView({ surveyURL: survey.url });
    } else {
      return false;
    }
  }
}
