class RecognitionsController < ApplicationController
  before_action :require_login

  def index
    @recognitions = Recognition.includes(:badge, :sender, :recipient).order(created_at: :desc)
    @recognition = Recognition.new
    @badges = Badge.order(:name)
    @users = User.order(:name)
  end

  def create
    @recognition = Recognition.new(recognition_params)
    @recognition.sender = current_user
    if @recognition.save
      @users = User.order(:name)
      @badges = Badge.order(:name)
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to root_path, notice: "Recognition sent" }
      end
    else
      @recognitions = Recognition.includes(:badge, :sender, :recipient).order(created_at: :desc)
      @badges = Badge.order(:name)
      @users = User.order(:name)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("recognition-form", partial: "form", locals: { recognition: @recognition, users: @users, badges: @badges }), status: :unprocessable_entity }
        format.html { render :index, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @recognition = Recognition.find(params[:id])
    @recognition.destroy
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to root_path, notice: "Recognition deleted" }
    end
  end

  private

  def recognition_params
    params.require(:recognition).permit(:recipient_id, :badge_id, :message)
  end
end
