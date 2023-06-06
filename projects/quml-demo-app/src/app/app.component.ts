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
  contentId = 'do_1137978322919096321137'; // do_213257772024733696115 do_2135552779830722561884 do_2135557748660469761931  do_113791502574157824197
  playerConfig: any;
  questionSetDetails: any;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getCourse(this.contentId).subscribe(res => {
      this.getQuestionSetData(res)
    });
  }
  getQuestionSetData(res:any){
    const reqBody = {
      contentID:res.questionSet.identifier,
      collectionID:res.collection.identifier,
      userID:'101ad6b3-502c-4ab4-a6cd-23d2ec7466b8',
      attemptID:uuid.v4(res.questionSet.identifier)
    }
    if(res.questionSet.evaluable){
      this.dataService.getServerEvaluableQuestionSet(reqBody).subscribe(res => {
        this.initializePlayer(res);
      });
    } else {
      this.dataService.getQuestionSet(this.contentId).subscribe(res => {
        this.initializePlayer(res);
      });
    }
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
    console.log('get player events', JSON.stringify(event));
    // Store the metaData locally
    if (event.eid === 'END') {
      let qumlMetaDataConfig = event.metaData;
      localStorage.setItem(`config_${this.contentId}`, JSON.stringify(qumlMetaDataConfig));
      this.playerConfig.config = { ...samplePlayerConfig.config, ...qumlMetaDataConfig };;
    }
  }

  getTelemetryEvents(event) {
    console.log('event is for telemetry', JSON.stringify(event));
  }

 
}
