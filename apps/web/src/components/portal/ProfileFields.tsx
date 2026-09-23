import { localDate, type DemoProfile } from "@/lib/demo-bookings";
export function profileFromForm(data: FormData): DemoProfile {
  const value = (name: string) => String(data.get(name) || "").trim();
  return {
    name: value("socialName") || value("legalName"),
    legalName: value("legalName"),
    socialName: value("socialName"),
    birthDate: value("birthDate"),
    motherName: value("motherName"),
    genderIdentity: value("genderIdentity"),
    pronouns: value("pronouns"),
    email: value("email"),
    phone: value("phone"),
  };
}
export function ProfileFields() {
  return (
    <>
      <div className="form-two-columns">
        <label>
          Nome civil
          <input
            name="legalName"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Seu nome civil completo"
          />
        </label>
        <label>
          Nome social <small>(se houver)</small>
          <input name="socialName" placeholder="Como você quer ser chamado" />
        </label>
        <label>
          Data de nascimento
          <input name="birthDate" type="date" max={localDate()} required />
        </label>
        <label>
          Nome da mãe
          <input
            name="motherName"
            minLength={2}
            required
            placeholder="Nome completo"
          />
        </label>
        <label>
          Identidade de gênero
          <input
            name="genderIdentity"
            required
            placeholder="Como você se identifica"
          />
        </label>
        <label>
          Pronomes <small>(opcional)</small>
          <input name="pronouns" placeholder="Ex.: ela/dela, ele/dele" />
        </label>
      </div>
      <label>
        WhatsApp com DDD
        <input
          name="phone"
          type="tel"
          autoComplete="tel-national"
          placeholder="(85) 99999-9999"
          pattern="\(?[1-9][0-9]\)?\s?[0-9]{4,5}[\s\-]?[0-9]{4}"
          required
        />
      </label>
      <p className="field-hint">
        Usaremos seu nome social e pronomes para tratar você como prefere. Nome,
        nascimento, mãe e gênero terão correção por solicitação na sua área.
      </p>
    </>
  );
}
