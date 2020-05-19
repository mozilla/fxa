import SurveyWrapperView from '../views/survey';
import Storage from './storage';
import createSurveyFilter from './survey-filter';

export default class SurveyTargeter {
  constructor(options) {
    this._storage = Storage.factory('localStorage', options.window);
    this.config = options.config; // Surveys config NOT app level config
    this.relier = options.relier;
    this.user = options.user;
    this.window = options.window;
  }

  async surveyMap() {
    if (this._surveyMap) return this._surveyMap;

    const filter = createSurveyFilter(
      this.window,
      this.user,
      this.relier,
      this._storage.get('lastSurvey'),
      this.config.doNotBotherSpan
    );

    this._surveyMap = this.config.surveys.reduce(async (acc, s) => {
      const satsifiedAllConditions = await filter(s);
      if (satsifiedAllConditions) {
        if (acc[s.view]) {
          acc[s.view].push(s);
        } else {
          acc[s.view] = [s];
        }
      }
      return acc;
    }, {});

    return this._surveyMap;
  }

  async getSurvey(view) {
    if (!this.config.enabled) {
      return false;
    }

    const surveyMap = await this.surveyMap();
    const surveysForView = surveyMap[view];
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
