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
    this.context = context
    this.viewStack = []
    this.goToStep(this.props.firstStepId)
  }

  goToStep = (stepId) => {
    if (this.currentStep) {
      this.viewStack.push({
        instance: this.currentStep,
        view: this.state.currentView
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
      currentView: step
    })
  }

  onBackButtonClicked = () => {
    const previousStep = this.viewStack.pop()
    if (previousStep) {
      if (previousStep.instance.rollback) { previousStep.instance.rollback() }
      this.showStep(previousStep.view)
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
      <Modal title="TODO: TITLE" closeHandler={this.closeModal}>
        <div className="section">
          { this.state.currentView }

          <div className="footer">
            <a className="icon is-pulled-right" onClick={this.onNextButtonClicked}>
              Next
              <i className="fa fa-chevron-right"></i>
            </a>
            <a className="icon" onClick={this.onBackButtonClicked}>
              <i className="fa fa-chevron-left"></i>
              Back
            </a>
          </div>
        </div>
      </Modal>
  }
}
