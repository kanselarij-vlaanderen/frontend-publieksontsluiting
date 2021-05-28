import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @service store;
  @service searchNewsItems;

  @tracked pageNumber = null;

  get showBackLink() {
    return this.searchNewsItems.hasFilter;
  }

  get hasMoreResults() {
    return this.searchNewsItems.cache.length < this.searchNewsItems.count;
  }

  get meetings() {
    // Order all news items by the meeting they belong to
    let meetings = [];
    this.searchNewsItems.cache.forEach((newsItem) => {
      let meeting = meetings.find(
        (meeting) => meeting.id === newsItem.meetingId
      );
      // Add each meeting to the meetings array
      if (!meeting) {
        const meetingRecord = this.store.findRecord(
          'meeting',
          newsItem.meetingId,
          { include: 'type' }
        );
        meeting = {
          id: newsItem.meetingId,
          date: newsItem.meetingDate,
          record: meetingRecord,
          news: [],
          announcements: [],
        };
        meetings.push(meeting);
      }
      // Add all news items to their meeting
      if (newsItem.agendaitemType.toLowerCase() === 'mededeling') {
        meeting.announcements.push(newsItem);
      } else {
        meeting.news.push(newsItem);
      }
    });
    return meetings;
  }

  @action
  searchNews() {
    this.searchNewsItems.search();
  }

  @action
  loadMore() {
    this.searchNewsItems.loadMore();
  }

  @action
  clearParams() {
    this.searchNewsItems.clearParams();
    this.searchNewsItems.search();
  }
}
