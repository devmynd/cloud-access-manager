import React from 'react'
import Modal from './modal'

// class DummyStep extends React.Component {
//   save = async () => {
//     console.log("Saving step")
//   }
//
//   rollback = async () => {
//     console.log("rolling back step")
//   }
//
//   validate = () => {
//     return true  // if all valid
//   }
//
//   chooseNextStep = () => {
//     return "step-2"
//   }
//
//   myCustomAction = () => {
//     console.log("I make my own choices!!!")
//     this.props.context.goToStep("step-3")
//   }
//
//   render() {
//     return <a className="button" onClick={this.myCustomAction}>Custom Action Button</a>
//   }
// }
//
// this.props.steps = {
//   "step-1": (ref, context) => {
//     return {
//       title: "Dummy Step 1",
//       hideNextButton: true,
//       component: <DummyStep ref={ref} context={context} />
//     }
//   }
// }

export default class ModalWizard extends React.Component {
  state = {
    showModal: false,
    currentStep: null
  }

  exitEarly = async () => {
    await this.rollback()
    this.closeModal()
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      currentStep: null
    })
  }

  rollback = async () => {
    let step = this.viewStack.pop()
    if (step){
      if (step.reference.rollback) {
        await step.reference.rollback()
      }
      this.rollback()
    }
  }

  start = (stepId, context) => {
    context = context || {}
    context.goToNext = this.onNextButtonClicked
    this.context = context
    this.viewStack = []
    this.goToStep(stepId)
  }

  saveCurrentStep = async (callback) => {
    if (this.currentStep) {
      if(this.currentStep.validate && !this.currentStep.validate()) {
        return
      }
      this.viewStack.push({
        reference: this.currentStep,
        step: this.state.step
      })
      if (this.currentStep.save) {
        await this.currentStep.save()
      }
    }

    callback()
  }

  goToStep = async (stepId) => {
    if(this.props.steps.hasOwnProperty(stepId)){
      const nextStepFactory = this.props.steps[stepId]
      const nextStep = nextStepFactory((ref) => {this.currentStep = ref}, this.context)
      this.showStep(nextStep)
    } else {
      throw new Error(`Invalid step id ${stepId}. Be sure you've defined the step.`)
    }
  }

  showStep = (step) => {
    this.setState({
      showModal: true,
      step: step
    })
  }

  onBackButtonClicked = async () => {
    const previousStep = this.viewStack.pop()
    if (previousStep) {
      if (previousStep.reference.rollback) {
        await previousStep.reference.rollback()
      }
      this.showStep(previousStep.step)
    } else {
      this.closeModal()
    }
  }

  onNextButtonClicked = () => {
    this.saveCurrentStep(() => {
      const nextStepId = this.currentStep.chooseNextStep && this.currentStep.chooseNextStep()
      if (nextStepId) {
        this.goToStep(nextStepId)
      } else {
        this.closeModal()
      }
    })
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.onNextButtonClicked()
  }

  render() {
    return this.state.showModal &&
      <Modal title={this.state.step.title} closeHandler={this.exitEarly}>
        <form className="section" onSubmit={this.onSubmit}>
          { this.state.step.component }
          <div>
            { !this.state.step.hideNextButton &&
              <a className="icon is-pulled-right" onClick={this.onNextButtonClicked}>
                Next
                <i className="fa fa-chevron-right"></i>
              </a>
            }
            <a className="icon" onClick={this.onBackButtonClicked}>
              <i className="fa fa-chevron-left"></i>
              Back
            </a>
          </div>
          <input type="submit" style={{display:"none"}} />
        </form>
      </Modal>
  }
}
