import React from 'react'
import Modal from './modal'

export default class ModalWizard extends React.Component {
  state = {
    showModal: false,
    currentStep: null
  }

  closeModal = (event) => {
    if (event) { event.preventDefault() }

    this.setState({
      showModal: false,
      currentStep: null
    })
  }

  start = (context) => {
    context = context || {}
    context.goToStep = this.goToStep
    this.context = context
    this.viewStack = []
    this.goToStep(this.props.firstStepId)
  }

  goToStep = (stepId) => {
    if (this.currentStep) {
      this.viewStack.push({
        reference: this.currentStep,
        step: this.state.step
      })
      if (this.currentStep.save) { this.currentStep.save() }
    }

    const nextStepFactory = this.props.steps[stepId]

    const nextStep = nextStepFactory((instance) => {this.currentStep = instance}, this.context, this.goToStep)
    this.showStep(nextStep)
  }

  showStep = (step) => {
    this.setState({
      showModal: true,
      step: step
    })
  }

  onBackButtonClicked = () => {
    const previousStep = this.viewStack.pop()
    if (previousStep) {
      if (previousStep.reference.rollback) { previousStep.reference.rollback() }
      this.showStep(previousStep.step)
    } else {
      this.closeModal()
    }
  }

  onNextButtonClicked = () => {
    const nextStepId = this.currentStep.chooseNextStep && this.currentStep.chooseNextStep()
    if (nextStepId) {
      this.goToStep(nextStepId)
    } else {
      this.closeModal()
    }
  }

  render() {
    return this.state.showModal &&
      <Modal title={this.state.step.title} closeHandler={this.closeModal}>
        <div className="section">
          { this.state.step.component }
          <div className="footer">
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
        </div>
      </Modal>
  }
}
