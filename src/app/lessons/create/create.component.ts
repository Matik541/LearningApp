import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LessonsService } from '../../lessons.service';
import { UsersService } from 'src/app/users.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

type Tags = { name: string };

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {
  @Output() result = new EventEmitter<{ key: string, data: Array<string> }>();

  @Input() data: Array<string> = [];
  @Input() key: string = '';

  selectControl = new FormControl();

  filterString: string = '';
  isEditable: boolean = true;

  formGroup1: FormGroup = this._formBuilder.group({
    title: new FormControl('', [Validators.required, Validators.pattern(/^(.|\s)*[a-zA-Z]+(.|\s)*$/)]),
    description: new FormControl('', [Validators.pattern(/^(.|\s)*[a-zA-Z]+(.|\s)*$/)]),
    icon: new FormControl('', [Validators.required])
  });
  formGroup2: FormGroup = this._formBuilder.group({
    formCtrl2: ['', Validators.required],
  });
  canCreate: boolean = false;
  
  // TODO: set icons presets
  icons = ['home', 'work', 'school', 'flash_on', 'face', 'pets', 'local_florist', 'local_drink', 'local_pizza', 'local_cafe', 'local_bar', 'local_grocery_store', 'local_library', 'local_hospital', 'local_pharmacy', 'local_laundry_service', 'local_post_office', 'local_taxi', 'local_parking', 'local_gas_station', 'local_police', 'local_convenience_store', 'local_dining', 'local_cinema', 'local_mall', 'local_play', 'local_see', 'local_sports', 'local_airport', 'local_atm', 'local_bank', 'local_barber', 'local_casino', 'local_florist', 'local_grocery_store', 'local_hospital', 'local_hotel', 'local_laundry_service', 'local_library', 'local_mall', 'local_movies', 'local_offer', 'local_parking', 'local_pharmacy', 'local_phone', 'local_pizza', 'local_play', 'local_post_office', 'local_printshop', 'local_see', 'local_shipping', 'local_taxi', 'local_bar', 'local_cafe', 'local_car_wash', 'local_convenience_store', 'local_dining', 'local_drink', 'local_florist', 'local_gas_station', 'local_grocery_store', 'local_hospital', 'local_hotel', 'local_laundry_service', 'local_library', 'local_mall', 'local_movies', 'local_offer', 'local_parking', 'local_pharmacy', 'local_phone', 'local_pizza', 'local_play', 'local_post_office', 'local_printshop', 'local_see', 'local_shipping', 'local_taxi', 'local_bar', 'local_cafe', 'local_car_wash', 'local_convenience_store', 'local_dining', 'local_drink', 'local_florist', 'local_gas_station', 'local_grocery_store', 'local_hospital', 'local_hotel', 'local_laundry_service', 'local_library', 'local_mall', 'local_movies', 'local_offer', 'local_parking', 'local_pharmacy', 'local_phone', 'local_pizza', 'local_play', 'local_post_office', 'local_printshop', 'local_see', 'local_shipping', 'local_taxi'];
  menuV: string = this.icons[0];

  lesson: { title: string, description: string, icon: string, author: number, flashcards: any[], tags: string[] };

  constructor(
    private _formBuilder: FormBuilder, 
    public dialogRef: MatDialogRef<CreateComponent>, 
    private lessonsService: LessonsService, 
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() { }

  create() {  
    this.lesson = {
      author: this.usersService.isLogged()?.id,
      flashcards: [],
      tags: [],

      ...this.formGroup1.value
    }
  }
}