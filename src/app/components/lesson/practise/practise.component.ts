import { Flashcard } from './../../../enums/enums'
import { PractiseFlashcard } from 'src/app/enums/enums'
import { Component, Input, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Lesson } from 'src/app/enums/enums'
import { Methods } from 'src/app/enums/enums'
import { ProgressBarService } from 'src/app/services/progress-bar.service'
import leven from 'leven'
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

  simpleMode: boolean = true
  display: boolean = true

  methodsData = {
    'boolean': {
      name: 'True/False',
      value: true,
      disabled: false,
      id: 0,
    },
    'multiple': {
      name: 'Multiple Choice',
      value: true,
      disabled: false,
      id: 1,
    },
    'match': {
      name: 'Match',
      value: false,
      disabled: true,
      id: 2,
    },
    'write': {
      name: 'Write',
      value: true,
      disabled: false,
      id: 3,
    }
  }
  methods: Methods[] = [
    Methods.BOOLEAN,
    Methods.MULTIPLE,
    Methods.MATCH,
    Methods.WRITE,  
    
  ]
  private variant: ('question' | 'answer')[] = ['question', 'answer']
  private answers: number[] = []
  private newAnswer: string | null = null

  private loaded: boolean = false

  constructor(
    private snackBar: MatSnackBar,
    private progressBarService: ProgressBarService,
  ) {
    


    let intedval = setInterval(() => {
      this.generateRound()
      if (this.loaded) 
        clearInterval(intedval)
    }, 100)
  }

  async generateRound() {
    if (!this.lesson.flashcards) return
    this.loaded = true

    if (this.round.size != this.lesson.flashcards.length)
      this.round.size = this.lesson.flashcards.length

    let flashcards: PractiseFlashcard[] = []
    let avableFlashcards =
      [...this.lesson.flashcards].sort(() => Math.random() - 0.5) ?? []

    for (let i = 0; i < this.round.size; i++) {
      this.variant.sort(() => Math.random() - 0.5)
      let flashcard: PractiseFlashcard = {} as PractiseFlashcard

      let methods: Methods[] = [];
      for (let method of this.methods)
        if (this.methodsData[method]?.value) {
          methods.push(method)
          break
        }

      let method = methods.sort(() => Math.random() - 0.5)[0]

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
    if (this.simpleMode) this.confirmAnswer()
  }

  confirmAnswer() {
    let score: number = 0
    let resolveing = this.round.flashcards[this.round.current]

    console.log(this.newAnswer)

    switch (resolveing.method) {
      case Methods.BOOLEAN:
        let avableFlashcards = [...this.lesson.flashcards]

        console.log(resolveing, this.newAnswer)

        let flashcardExists = avableFlashcards.some((flashcard) => {
          if (
            (flashcard[resolveing.variant[0]] === resolveing.answer &&
              flashcard[resolveing.variant[1]] === resolveing.question) ||
            (flashcard[resolveing.variant[1]] === resolveing.answer &&
              flashcard[resolveing.variant[0]] === resolveing.question)
          ) {
            return true
          }
          return false
        })

        if (
          (flashcardExists && this.newAnswer === resolveing.answer) ||
          this.newAnswer === resolveing.question ||
          (!flashcardExists && this.newAnswer === null)
        )
          score = 1
        break
      case Methods.MULTIPLE:
        if (this.newAnswer)
          if (resolveing.answers?.includes(this.newAnswer)) score = 1
        break
      case Methods.MATCH:
        break
      case Methods.WRITE:
        if (resolveing.answers?.includes(this.newAnswer ?? '')) {
          score = 1
          break
        }

        if (!this.newAnswer) {
          score = 0
          break
        }

        let input = this.newAnswer as string
        let similarityScores: number[] | undefined = resolveing.answers?.map(
          (value) => {
            return (
              1 -
              leven(this.normalizeString(input), this.normalizeString(value)) /
                Math.max(input.length, value.length)
            )
          },
        )

        score = Math.max(...(similarityScores ?? [0]))
    }

    console.log(score, this.answers)

    if (this.answers[this.round.current])
      this.answers[this.round.current] = score
    else this.answers.push(score)

    this.display = false
    this.round.current++
    setTimeout(() => {
      this.display = true
    }, 50)

    let navBar = this.progressBarService.getBar('navigation')
    if (navBar) {
      navBar.max = this.round.size
      navBar.current = this.round.current
    }

    if (this.round.current >= this.round.size) {
      this.snackBar.open(
        `You scored ${
          this.answers.filter((answer) => answer >= 0.7).length
        } out of ${this.round.size}`,
        'Close',
        {
          duration: 2000,
        },
      )
      this.generateRound()
    }
  }

  updateMethods() {
    this.display = false
    let navBar = this.progressBarService.getBar('navigation')
    if (navBar) navBar.current = 0

    if (
      !Object.values(this.methodsData).some((method) => method.value)
    ) {
      this.snackBar.open('Please select at least one method', 'Close', {
        duration: 2000,
      })
      this.methodsData['boolean'].value = true
      return
    }

    setTimeout(() => {
      this.display = true
    }, 50)
    
    setTimeout(() => (this.display = true), 50)
    this.generateRound()
  }

  private normalizeString(input: string): string {
    return input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  }
}
