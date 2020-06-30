import SurveyWrapperView from '../views/survey';
import Storage from './storage';
import createSurveyFilter from './survey-filter';
import Url from './url';

const lastSurveyKey = 'lastSurvey';

export default class SurveyTargeter {
  constructor(options) {
    this._storage = Storage.factory('localStorage', options.window);
    this.config = options.config; // Surveys config NOT app level config
    this.relier = options.relier;
    this.user = options.user;
    this.window = options.window;
    this.surveys = options.surveys;

    this._buildSurveysByViewPathMap();
  }

  /**
   * Construct a view path to surveys map.  This is the first thing to be
   * checked upon navigation/view rendering.
   */
  _buildSurveysByViewPathMap() {
    this._surveysByViewNameMap = this.surveys.reduce((acc, s) => {
      acc[s.view] ? acc[s.view].push(s) : (acc[s.view] = [s]);
      return acc;
    }, {});
  }

  _selectSurvey(surveys) {
    return surveys[Math.floor(Math.random() * surveys.length)];
  }

  /**
   * Get a survey with a filter based on the current state of the dependencies.
   * It takes into account whether any surveys are configured for the current
   * view and whether the user has taken a survey recently.
   */
  async getSurvey(viewName) {
    if (!this._surveysByViewNameMap[viewName]) {
      return false;
    }

    const filter = createSurveyFilter(
      this.window,
      this.user,
      this.relier,
      this._storage.get(lastSurveyKey),
      this.config.doNotBotherSpan
    );

    try {
      const qualifiedSurveys = (
        await Promise.all(
          this._surveysByViewNameMap[viewName].map(async (survey) => {
            const { passing, conditions } = await filter(survey);
            if (passing) {
              return { survey, conditions };
            }
          })
        )
      ).filter((s) => !!s);

      if (qualifiedSurveys.length === 0) {
        return false;
      }

      const selectedSurvey = this._selectSurvey(qualifiedSurveys);
      this._storage.set(lastSurveyKey, Date.now());
      const surveyURL = Url.updateSearchString(
        selectedSurvey.survey.url,
        selectedSurvey.conditions
      );
      return new SurveyWrapperView({ surveyURL });
    } catch {
      return false;
    }
  }
}
