import Service from '@ember/service';
import { A } from '@ember/array';
import moment from 'moment';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

export default Service.extend({
  count: 0,

  init() {
    this._super(...arguments);
    this.set('cache', A());
  },

  async search(params) {
    this.set('searchParams', params);
    this.set('searchParams.pageNumber', 0);
    this.set('searchParams.pageSize', 25);
    const newsItems = await this.searchTask.perform();
    this.set('cache', A(newsItems));
  },

  async loadMore() {
    this.set('searchParams.pageNumber', this.searchParams.pageNumber + 1);
    const newsItems = await this.searchTask.perform();
    this.cache.pushObjects(newsItems);
  },

  searchTask: task(function * () {
    const { search, startDate, endDate, presentedById, ministerialPowerId, pageNumber, pageSize } = this.searchParams;
    const rootURL = '/vlaamse-regering/beslissingenvlaamseregering/'; // TODO retrieve rootURL from config/environment.js
    let endpoint = `${rootURL}news-items/search?page[size]=${pageSize}&page[number]=${pageNumber}&sort[sessionDate]=desc&sort[priority]=asc`;

    if (search || startDate || endDate || presentedById || ministerialPowerId ) {
      if (search)
        endpoint += `&filter[htmlContent]=${search}`;
      if (startDate)
        endpoint += `&filter[:gte:sessionDate]=${moment(startDate, 'DD-MM-YYYY').toDate().toISOString()}`;
      if (endDate)
        endpoint += `&filter[:lte:sessionDate]=${moment(endDate, 'DD-MM-YYYY').toDate().toISOString()}`;
      if (presentedById)
        endpoint += `&filter[mandateeIds]=${presentedById}`;
      if (ministerialPowerId)
        endpoint += `&filter[themeId]=${ministerialPowerId}`;
    } else {
      endpoint += `&filter[:sqs:title]=*`;
    }

    const json = yield (yield fetch(endpoint)).json();
    this.set('count', json.count);
    return json.data.map(item => item.attributes);
  }).keepLatest()
});
