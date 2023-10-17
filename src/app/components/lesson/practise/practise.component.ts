import { Flashcard } from './../../../enums/enums'
import { PractiseFlashcard } from 'src/app/enums/enums'
import { Component, Input, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Lesson } from 'src/app/enums/enums'
import { Methods } from 'src/app/enums/enums'
import { ProgressBarService } from 'src/app/services/progress-bar.service'
@Component({
  selector: 'lesson-practise',
  templateUrl: './practise.component.html',
  styleUrls: ['./practise.component.scss'],
})
export class PractiseComponent {
  @Input() lesson: Lesson = {} as Lesson

  round: {
    size: number
    current: number
    flashcards: PractiseFlashcard[]
  } = {
    size: 0,
    current: 0,
    flashcards: [],
  }

  simpleMode: boolean = false
  display: boolean = true

  methods: {
    name: string
    value: boolean
    id: Methods
  }[] = []

  private variant: ('question' | 'answer')[] = ['question', 'answer']
  private out: any
  private answers: number[] = []
  private newAnswer: string | null = null

  constructor(
    private snackBar: MatSnackBar,
    private progressBarService: ProgressBarService,
  ) {
    this.methods[Methods.BOOLEAN] = {
      name: 'True/False',
      value: false,
      id: Methods.BOOLEAN,
    }
    this.methods[Methods.MULTIPLE] = {
      name: 'Multiple Choice',
      value: true,
      id: Methods.MULTIPLE,
    }
    // this.methods[Methods.MATCH] = { name: 'Match', value: false, id: Methods.MATCH }
    // this.methods[Methods.WRITE] = { name: 'Write', value: false, id: Methods.WRITE }

    if (this.lesson.flashcards) this.generateRound()
    else this.out = setInterval(() => this.generateRound(), 50)
  }

  async generateRound() {
    if (!this.lesson.flashcards) return

    if (this.out) clearInterval(this.out)

    if (this.round.size != this.lesson.flashcards.length)
      this.round.size = this.lesson.flashcards.length

    let flashcards: PractiseFlashcard[] = []
    let avableFlashcards =
      [...this.lesson.flashcards].sort(() => Math.random() - 0.5) ?? []

    for (let i = 0; i < this.round.size; i++) {
      this.variant.sort(() => Math.random() - 0.5)
      let flashcard: PractiseFlashcard = {} as PractiseFlashcard

      let method = [...this.methods]
        .filter((method) => method.value)
        .sort(() => Math.random() - 0.5)[0].id

      switch (method) {
        case Methods.BOOLEAN:
          let answers = avableFlashcards.filter(
            (flashcard) =>
              flashcard.answer !== avableFlashcards[i][this.variant[0]],
          )
          flashcard = {
            method: Methods.BOOLEAN,
            variant: this.variant,
            question: avableFlashcards[i][this.variant[0]],
            answer:
              Math.random() > 0.5
                ? avableFlashcards[i][this.variant[1]]
                : answers[Math.floor(Math.random() * answers.length)][
                    this.variant[1]
                  ],
          }
          break

        case Methods.MULTIPLE:
          flashcard = {
            method: Methods.MULTIPLE,
            variant: this.variant,
            question: avableFlashcards[i][this.variant[0]],
            options: [...avableFlashcards]
              .filter(
                (flashcard) =>
                  flashcard[this.variant[1]] !==
                  avableFlashcards[i][this.variant[1]],
              )
              .sort(() => Math.random() - 0.5)
              .map((flashcard) => flashcard[this.variant[1]])
              .splice(0, 3),
            answers: [...avableFlashcards]
              .filter(
                (flashcard) =>
                  flashcard[this.variant[1]] ===
                  avableFlashcards[i][this.variant[1]],
              )
              .map((flashcard) => flashcard[this.variant[1]]),
          }
          break

        case Methods.WRITE:
          flashcard = {
            method: Methods.WRITE,
            variant: this.variant,
            question: avableFlashcards[i][this.variant[0]],
            answers: [...avableFlashcards]
              .filter(
                (flashcard) =>
                  flashcard[this.variant[1]] ===
                  avableFlashcards[i][this.variant[1]],
              )
              .map((flashcard) => flashcard[this.variant[1]]),
          }
          break

        case Methods.MATCH:
          console.error('Match method not implemented yet')
          break
      }

      flashcards.push(flashcard)
    }

    this.round.flashcards = flashcards
    this.round.current = 0
  }

  changeAnswer(answer: string | null): void {
    this.newAnswer = answer

    if (this.simpleMode) this.confirmAnswer();
  }

  confirmAnswer() {
    let score: number = 0
    let resolveing = this.round.flashcards[this.round.current]

    switch (resolveing.method) {
      case Methods.BOOLEAN:
        if (
          (resolveing.variant[0] === 'question' &&
            resolveing.answer === this.newAnswer) ||
          (resolveing.variant[0] === 'answer' && this.newAnswer === null)
        ) {
          score = 1
        }
        break
      case Methods.MULTIPLE:
        if (this.newAnswer)
          if (resolveing.answers?.includes(this.newAnswer)) score = 1
        break
      case Methods.MATCH:
        break
      case Methods.WRITE:
        break
    }

    console.log(score, this.answers)

    if (this.answers[this.round.current]) this.answers[this.round.current] = score
    else this.answers.push(score)

    this.display = false
    this.round.current++
    setTimeout(() => (this.display = true), 50)

    let navBar = this.progressBarService.getBar('test')
    if (navBar)
      navBar.current = 30;

    if (this.round.current >= this.round.size) {
      this.snackBar.open(
        `You scored ${this.answers.filter((answer) => answer === 1).length} out of ${this.round.size}`,
        'Close',
        {
          duration: 2000,
        },
      )
      this.generateRound()
    }
  }

  updateMethods() {
    if (this.methods.every((method) => method.value === false)) {
      this.snackBar.open('You must select at least one method', 'Close', {
        duration: 2000,
      })
      this.methods[Methods.BOOLEAN].value = true
    }
    this.generateRound()
  }
}
