/**
 * Created by sunfei on 2017/9/2.
 */

import Source from '../source'
export default () => {
    return new Source('performance', (action) => {
        let navigation;
        window.onload = function() {
            let timing = window.performance.timing;
            const  navigation = window.performance.navigation;
            const loadTime = timing.loadEventEnd - timing.navigationStart;//过早获取时,loadEventEnd有时会是0
            if (loadTime < 0) {
                setTimeout(function () {
                    timing = window.performance.timing;
                    action({
                        category: 'performance',
                        payload:  {timing, navigation}
                    })

                }, 0);
            } else {
                action({
                    category: 'performance',
                    payload:  {timing, navigation}
                })
            }

        };


    })


}