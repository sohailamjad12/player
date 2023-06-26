import { Component, OnInit } from '@angular/core';
import { samplePlayerConfig } from './quml-library-data';
import { DataService } from './services/data.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // contentId = 'do_11381197399589683218'; // do_213257772024733696115 do_2135552779830722561884 do_2135557748660469761931,do_113807105203314688117
  contentId = 'do_113812213470920704115';
  //do_11381197399589683218 serverEvaluable field is true
  //course id do_1138113501713530881128, do_113812213470920704115
  playerConfig: any;
  telemetryEvents: any = [];
  questionSetDetails: any;
  questionSetEvaluable: boolean = false;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    // this.dataService.getQuestionSet(this.contentId).subscribe(res => {
    //   this.initializePlayer(res);
    // });
    //comment above line and uncomment below line for course do_id.
    this.dataService.getCourse(this.contentId).subscribe(res => {
      this.getQuestionSetData(res)
    });
  }

  initializePlayer(metadata) {
    let qumlConfigMetadata: any = localStorage.getItem(`config_${this.contentId}`) || '{}';
    let config;
    if (qumlConfigMetadata) {
      qumlConfigMetadata = JSON.parse(qumlConfigMetadata);
      config = { ...samplePlayerConfig.config, ...qumlConfigMetadata };
    }
    this.playerConfig = {
      context: samplePlayerConfig.context,
      config: config ? config : samplePlayerConfig.config,
      metadata,
      data: {}
    };
  }

  getPlayerEvents(event) {
    console.log('get player events', JSON.parse(JSON.stringify(event)));

    // Store the metaData locally
    if (event.eid === 'END') {
      let qumlMetaDataConfig = event.metaData;
      localStorage.setItem(`config_${this.contentId}`, JSON.stringify(qumlMetaDataConfig));
      this.playerConfig.config = { ...samplePlayerConfig.config, ...qumlMetaDataConfig };;
    }
  }

  getTelemetryEvents(event) {
    this.telemetryEvents.push(JSON.parse(JSON.stringify(event)));
    console.log('event is for telemetry', this.telemetryEvents);
  }

  getQuestionSetData(res:any){
    const reqBody = {
      contentID:res.questionSet.identifier,
      collectionID:res.collection.identifier,
      userID:'101ad6b3-502c-4ab4-a6cd-23d2ec7466b8',
      attemptID:uuid.v4(res.questionSet.identifier)
    }
    this.questionSetEvaluable = res.questionSet?.eval?.mode.toLowerCase() == 'server';
    if(this.questionSetEvaluable) {
      this.dataService.getServerEvaluableQuestionSet(reqBody, res.questionSet.identifier).subscribe(res => {
        this.initializePlayer(res);
      });
    } else {
      this.dataService.getQuestionSet(this.contentId).subscribe(res => {
        this.initializePlayer(res);
      });
    }
  }

}
