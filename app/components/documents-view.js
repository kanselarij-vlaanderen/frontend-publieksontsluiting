import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class DocumentsViewComponent extends Component {
  @service store;

  tagName = '';
  @tracked isExpanded = false;
  @tracked attachments = [];

  didReceiveAttrs() {
    if (this.model) {
      this.fetchRecord.perform();
    }
  }

  @action
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  @(task(function* () {
    const id = this.model.uuid;
    let record = this.store.peekRecord('news-item-info', id);
    if (!record) {
      record = yield this.store.findRecord('news-item-info', id, {
        include: 'attachments.file'
      });
    }
    this.attachments = record.attachments.sortBy('title');
  }).keepLatest()) fetchRecord;
}
