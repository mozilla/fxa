### Example Usage

```javascript

  import Survey, { CreateHandleIframeTask } from '@fxa-components/Survey';

  const [showSurvey, setShowSurvey] = useState(true);
  const [surveyComplete, setSurveyComplete] = useState(false);

  const handleIframeTask = CreateHandleIframeTask(() => {
    setSurveyComplete(true);
    setTimeout(() => {
      setShowSurvey(false);
    }, 300);
  });

  useEffect(() => {
    // here we are listening for the 'survey complete'
    // message from surveygizmo
    window.addEventListener('message', handleIframeTask);
    return () => window.removeEventListener('message', handleIframeTask);
  });

  // ...

  return (
    <div className='my-app'>
      {showSurvey && <Survey surveyUrl={'https://my-survey-url.com'} {...{surveyComplete}}>}
    </div>
  )

```
