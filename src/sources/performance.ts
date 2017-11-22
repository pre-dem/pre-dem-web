import Source from '../source'
import {parse} from 'url'
import {getDominFromUrl} from './../utils'

export default () => {

  return new Source('performance', (action) => {
    window.onload = function () {

      let timing = null;
      const newResourceTimings = [];

      if (!window.performance) {
        return false;
      }

      timing = performance.timing;


      if (window.performance.getEntries) {
        const resourceTimings = window.performance.getEntries();
        if (resourceTimings && resourceTimings.length > 0) {
          resourceTimings.map((resourceTiming: any) => {
            if (resourceTiming.entryType === "resource") {

              var cleanObject = JSON.parse(JSON.stringify(resourceTiming))
              cleanObject.domain = getDominFromUrl(cleanObject.name).domain
              cleanObject.path = getDominFromUrl(cleanObject.name).path
              newResourceTimings.push(cleanObject);
            }

          });

          action({
            category: 'performance',
            payload: {timing, resourceTimings: newResourceTimings}
          });
        }

      } else {
        action({
          category: 'performance',
          payload: {timing, resourceTimings: []}
        });
      }


    };

  })


}