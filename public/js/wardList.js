function standardizeNames(report) {
    let all = report.map(m => ({
        id:         m.id,
        name:       m.PREFERRED_NAME,
        last:       m.PREFERRED_NAME.split(',')[0],
        first:      m.PREFERRED_NAME.split(',')[1].substring(1),
        city:       m.ADDRESS_CITY              ??"",
        address1:   m.ADDRESS_STREET_1,
        address2:   m.ADDRESS_STREET_2          ??"",
        zip:        m.ADDRESS_POSTAL_CODE       ??"",
        age:        m.AGE,
        gender:     m.GENDER,
        baptized:   m.BAPTISM_DATE,
        birthday:   m.BIRTHDAY,
        hasMinBros: m.HAS_HOME_TEACHER          =="Yes",
        hasMinSiss: m.HAS_VISITING_TEACHERS     =="Yes",
        minBros:    m.HOME_TEACHERS             ??"---",
        homePhone:  m.HOUSEHOLD_PHONE           ??"---",
        email:      m.INDIVIDUAL_EMAIL          ??"---",
        phone:      m.INDIVIDUAL_PHONE          ??"---",
        institute:  m.IS_ATTENDING_INSTITUTE    =="Yes",
        convert:    m.IS_CONVERT                =="Yes",
        endowed:    m.IS_ENDOWED                =="Yes",
        RM:         m.IS_RETURNED_MISSIONARY    =="Yes",
        sealed:     m.IS_SEALED_TO_PARENTS      =="Yes",
        movedIn:    m.MOVE_IN_DATE,
        priesthood: m.PRIESTHOOD_OFFICE         ??"---",
        recExpire:  m.TEMPLE_RECOMMEND_EXPIRATION_DATE !== "" ? ("1 " + m.TEMPLE_RECOMMEND_EXPIRATION_DATE) : "---"  ,
        recStatus:  m.TEMPLE_RECOMMEND_STATUS   ??"---",
        recType:    m.TEMPLE_RECOMMEND_TYPE     ??"---",
        minSiss:    m.VISITING_TEACHERS         ??"---",
        lat:   0, 
        long:  0, 
        notes: "none"
    }));

    var values = [];
    for(var o of all) {
        values.push({ key: o.name, value: o });
    }
    values.sort(function(a, b) { return a.key.localeCompare(b.key); });
    var arr = values.map(function (kvp) { return kvp.value; });
    return  arr;
}

function setGPSandNotes(members, LS_GPS, bpNotes) {
    members.every(w => {
        LS_GPS.every(g => {
            if (g.name == w.name) {
                w.lat  = g.lat;
                w.long = g.long;
                return false;
            }
            return true;
        });
        
        if (bpNotes === null)       return true;

        bpNotes.every(n => {
            if (n.name == w.name) {
                w.notes = n.notes;
                return false;
            }
            return true;
        });
        return true;
    });
}