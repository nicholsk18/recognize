class BadgesController < ApplicationController
  def index
    @badges = Badge.order(:name)
    @badge = Badge.new
  end

  def create
    @badge = Badge.new(badge_params)
    if @badge.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to badges_path, notice: "Badge created" }
      end
    else
      @badges = Badge.order(:name)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("badge-form", partial: "form", locals: { badge: @badge }), status: :unprocessable_entity }
        format.html { render :index, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @badge = Badge.find(params[:id])
    if @badge.destroy
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to badges_path, notice: "Badge deleted" }
      end
    else
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.append("toast-container", partial: "shared/toast", locals: { kind: :error, message: @badge.errors.full_messages.join(", ") }) }
        format.html { redirect_to badges_path, alert: @badge.errors.full_messages.join(", ") }
      end
    end
  end

  private

  def badge_params
    params.require(:badge).permit(:name, :slug)
  end
end
